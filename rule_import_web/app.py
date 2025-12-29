import os
import pandas as pd
import psycopg2
from psycopg2 import sql
from flask import Flask, render_template, request, redirect, url_for, send_file, flash, jsonify
from werkzeug.utils import secure_filename
from datetime import datetime
import traceback
from config import Config

app = Flask(__name__)

# 从Config类加载配置
app.config.from_object(Config)

# 确保目录存在
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs('static/templates', exist_ok=True)

ALLOWED_EXTENSIONS = {'xlsx', 'xls'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_db_connection():
    """创建PostgreSQL数据库连接"""
    try:
        conn = psycopg2.connect(
            host=app.config['DB_HOST'],
            port=app.config['DB_PORT'],
            database=app.config['DB_NAME'],
            user=app.config['DB_USER'],
            password=app.config['DB_PASSWORD']
        )
        return conn
    except Exception as e:
        print(f"数据库连接错误: {e}")
        return None

def create_table_if_not_exists():
    """创建表（如果不存在）"""
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS rulelibtable (
        rule_id VARCHAR(50) PRIMARY KEY,
        rule_name VARCHAR(100),
        trigger_type VARCHAR(50),
        trigger_content TEXT,
        response_type VARCHAR(50),
        response_content TEXT,
        priority INTEGER,
        enabled BOOLEAN,
        category VARCHAR(50),
        tags VARCHAR(200),
        created_time TIMESTAMP,
        updated_time TIMESTAMP
    );
    """
    
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute(create_table_sql)
            conn.commit()
            cursor.close()
            conn.close()
            print("表创建/检查完成")
        except Exception as e:
            print(f"创建表错误: {e}")
    else:
        print("无法连接到数据库，跳过表创建")

def check_table_exists():
    """检查表是否存在"""
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'rulelibtable'
            );
        """)
        exists = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        return exists
    except Exception as e:
        print(f"检查表存在错误: {e}")
        return False

@app.route('/')
def index():
    """主页"""
    return render_template('index.html')

@app.route('/download_template')
def download_template():
    """下载Excel模板"""
    template_path = app.config['TEMPLATE_FILE']
    
    # 如果模板目录不存在，创建它
    os.makedirs(os.path.dirname(template_path), exist_ok=True)
    
    if os.path.exists(template_path):
        return send_file(template_path, as_attachment=True, download_name='rulesLib001_template.xlsx')
    else:
        # 如果模板不存在，创建一个示例模板
        data = {
            'rule_id': ['R001', 'R002', 'R003', 'R004', 'R005', 'R006'],
            'rule_name': ['问候规则', '功能查询', '产品功能', '联系方式', '日期时间', '精确匹配测试'],
            'trigger_type': ['keyword', 'keyword', 'keyword', 'keyword', 'keyword', 'exact'],
            'trigger_content': [
                '你好,您好,hello,hi,嗨',
                '功能,能做什么,可以做什么,有什么用',
                '产品,你们的产品',
                '联系,客服,电话,邮箱,支持',
                '日期,时间,现在几点,今天星期几',
                'who are you'
            ],
            'response_type': ['text', 'text', 'text', 'text', 'dynamic', 'text'],
            'response_content': [
                '您好！我是智能助手，很高兴为您服务。有什么可以帮到您吗？',
                '## 我的主要功能<br><br>1. 回答产品相关问题<br>2. 提供技术支持<br>3. 解答常见问题<br>4. AI模型辅助回答复杂问题',
                '## 我们的产品系列<br><br>### 核心产品<br>1. 智能助手Pro - 企业级AI对话解决方案<br>2. 数据分析平台 - 可视化数据洞察工具<br>3. 云协作套件 - 团队协作工具集',
                '## 联系方式<br><br>- 客服电话: 400-123-4567<br>- 技术支持邮箱: support@example.com<br>- 服务时间: 周一至周五 9:00-18:00',
                '当前时间: {time}<br>当前日期: {date}<br>今天是: {weekday}',
                'I am an intelligent assistant designed to help you with various tasks.'
            ],
            'priority': [10, 8, 7, 6, 5, 9],
            'enabled': [True, True, True, True, True, True],
            'category': ['greeting', 'general', 'product', 'contact', 'general', 'test'],
            'tags': ['基础,问候', '功能,帮助', '产品,销售', '联系,客服', '时间,日期', '测试,英文'],
            'created_time': [datetime.now()] * 6,
            'updated_time': [datetime.now()] * 6
        }
        
        df = pd.DataFrame(data)
        df.to_excel(template_path, index=False)
        return send_file(template_path, as_attachment=True, download_name='rulesLib001_template.xlsx')

@app.route('/upload', methods=['POST'])
def upload_file():
    """处理文件上传和导入"""
    if 'file' not in request.files:
        return jsonify({'error': '没有选择文件'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': '没有选择文件'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # 读取Excel文件
            df = pd.read_excel(filepath, engine='openpyxl')
            
            # 检查必要的列是否存在
            required_columns = [
                'rule_id', 'rule_name', 'trigger_type', 'trigger_content',
                'response_type', 'response_content', 'priority', 'enabled',
                'category', 'tags', 'created_time', 'updated_time'
            ]
            
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                return jsonify({
                    'error': f'Excel文件中缺少必要的列: {", ".join(missing_columns)}'
                }), 400
            
            # 连接数据库
            conn = get_db_connection()
            if not conn:
                return jsonify({'error': '无法连接到数据库'}), 500
            
            cursor = conn.cursor()
            
            # 清空表（可选，根据需求）
            # cursor.execute("TRUNCATE TABLE rulelibtable;")
            
            # 准备插入语句
            insert_sql = """
            INSERT INTO rulelibtable 
            (rule_id, rule_name, trigger_type, trigger_content, response_type, 
             response_content, priority, enabled, category, tags, created_time, updated_time)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (rule_id) DO UPDATE SET
                rule_name = EXCLUDED.rule_name,
                trigger_type = EXCLUDED.trigger_type,
                trigger_content = EXCLUDED.trigger_content,
                response_type = EXCLUDED.response_type,
                response_content = EXCLUDED.response_content,
                priority = EXCLUDED.priority,
                enabled = EXCLUDED.enabled,
                category = EXCLUDED.category,
                tags = EXCLUDED.tags,
                updated_time = EXCLUDED.updated_time;
            """
            
            success_count = 0
            error_count = 0
            error_messages = []
            
            # 逐行插入数据
            for index, row in df.iterrows():
                try:
                    # 处理时间字段
                    created_time = pd.to_datetime(row['created_time'], errors='coerce')
                    updated_time = pd.to_datetime(row['updated_time'], errors='coerce')
                    
                    # 如果时间转换失败，使用当前时间
                    if pd.isna(created_time):
                        created_time = datetime.now()
                    if pd.isna(updated_time):
                        updated_time = datetime.now()
                    
                    # 准备数据
                    data = (
                        str(row['rule_id']) if pd.notna(row['rule_id']) else f'R{index+1:03d}',
                        str(row['rule_name']) if pd.notna(row['rule_name']) else f'规则{index+1}',
                        str(row['trigger_type']) if pd.notna(row['trigger_type']) else 'keyword',
                        str(row['trigger_content']) if pd.notna(row['trigger_content']) else '',
                        str(row['response_type']) if pd.notna(row['response_type']) else 'text',
                        str(row['response_content']) if pd.notna(row['response_content']) else '',
                        int(row['priority']) if pd.notna(row['priority']) else 0,
                        bool(row['enabled']) if pd.notna(row['enabled']) else True,
                        str(row['category']) if pd.notna(row['category']) else '',
                        str(row['tags']) if pd.notna(row['tags']) else '',
                        created_time,
                        updated_time
                    )
                    
                    cursor.execute(insert_sql, data)
                    success_count += 1
                    
                except Exception as e:
                    error_count += 1
                    error_messages.append(f"第 {index + 2} 行错误: {str(e)}")
                    print(f"导入第 {index + 2} 行时出错: {e}")
                    continue
            
            conn.commit()
            cursor.close()
            conn.close()
            
            # 删除临时文件
            if os.path.exists(filepath):
                os.remove(filepath)
            
            return jsonify({
                'success': True,
                'message': f'导入完成！成功: {success_count} 条，失败: {error_count} 条',
                'success_count': success_count,
                'error_count': error_count,
                'errors': error_messages[:10] if error_messages else None  # 最多显示10个错误
            })
            
        except Exception as e:
            # 删除临时文件
            if os.path.exists(filepath):
                os.remove(filepath)
            
            return jsonify({
                'error': f'处理文件时出错: {str(e)}',
                'traceback': traceback.format_exc()
            }), 500
    
    return jsonify({'error': '不支持的文件格式，请上传Excel文件 (.xlsx, .xls)'}), 400

@app.route('/view_data')
def view_data():
    """查看已导入的数据"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': '无法连接到数据库'}), 500
    
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM rulelibtable;")
        total_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT * FROM rulelibtable ORDER BY priority DESC, rule_id LIMIT 100;")
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        # 格式化数据以便JSON序列化
        data = []
        for row in rows:
            row_dict = {}
            for i, column in enumerate(columns):
                value = row[i]
                if isinstance(value, datetime):
                    row_dict[column] = value.strftime('%Y-%m-%d %H:%M:%S')
                elif isinstance(value, bool):
                    row_dict[column] = '是' if value else '否'
                elif value is None:
                    row_dict[column] = ''
                else:
                    row_dict[column] = str(value)
            data.append(row_dict)
        
        return jsonify({
            'total_count': total_count,
            'columns': columns,
            'data': data
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health')
def health_check():
    """健康检查端点"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'status': 'unhealthy', 'database': 'disconnected'}), 500
        
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM rulelibtable;")
        count = cursor.fetchone()[0]
        
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'rulelibtable'
            );
        """)
        table_exists = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'status': 'healthy', 
            'database': 'connected',
            'table_exists': table_exists,
            'record_count': count
        })
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

@app.route('/test_db')
def test_db():
    """测试数据库连接"""
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT version();")
            version = cursor.fetchone()
            cursor.close()
            conn.close()
            return f"数据库连接成功！PostgreSQL版本: {version[0]}"
        except Exception as e:
            return f"数据库连接成功但查询失败: {str(e)}"
    else:
        return "数据库连接失败"

@app.route('/init_db')
def init_db():
    """初始化数据库表"""
    create_table_if_not_exists()
    return jsonify({'message': '数据库表初始化完成', 'table_exists': check_table_exists()})

@app.route('/clear_data', methods=['POST'])
def clear_data():
    """清空数据（谨慎使用）"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': '无法连接到数据库'}), 500
        
        cursor = conn.cursor()
        cursor.execute("TRUNCATE TABLE rulelibtable;")
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'success': True, 'message': '数据已清空'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/config_info')
def config_info():
    """显示配置信息（用于调试）"""
    # 安全地显示配置信息，但不显示密码
    config_info = {
        'db_host': app.config['DB_HOST'],
        'db_port': app.config['DB_PORT'],
        'db_name': app.config['DB_NAME'],
        'db_user': app.config['DB_USER'],
        'db_password_set': '已设置' if app.config['DB_PASSWORD'] else '未设置',
        'upload_folder': app.config['UPLOAD_FOLDER'],
        'template_file': app.config['TEMPLATE_FILE'],
        'max_content_length_mb': app.config['MAX_CONTENT_LENGTH'] / (1024 * 1024)
    }
    return jsonify(config_info)

if __name__ == '__main__':
    print("=" * 60)
    print("规则库导入Web应用启动")
    print("=" * 60)
    print("配置信息:")
    print(f"  数据库主机: {app.config['DB_HOST']}")
    print(f"  数据库端口: {app.config['DB_PORT']}")
    print(f"  数据库名称: {app.config['DB_NAME']}")
    print(f"  数据库用户: {app.config['DB_USER']}")
    print(f"  数据库密码: {'*' * len(app.config['DB_PASSWORD']) if app.config['DB_PASSWORD'] else '未设置'}")
    print(f"  上传目录: {app.config['UPLOAD_FOLDER']}")
    print(f"  模板文件: {app.config['TEMPLATE_FILE']}")
    print("=" * 60)
    
    # 确保表存在
    create_table_if_not_exists()
    
    # 检查数据库连接
    conn = get_db_connection()
    if conn:
        print("数据库连接成功！")
        conn.close()
    else:
        print("警告: 数据库连接失败，请检查配置")
    
    # 确保上传目录存在
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    print(f"应用已启动，访问地址: http://localhost:5000")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5000)