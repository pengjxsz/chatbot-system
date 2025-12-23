-- ========================================
-- 规则库数据表创建脚本
-- ========================================

-- 删除已存在的表（如果需要重新创建）
DROP TABLE IF EXISTS rulelibtable CASCADE;

-- 创建规则库表
CREATE TABLE rulelibtable (
    id SERIAL PRIMARY KEY,                          -- 自增主键
    rule_id VARCHAR(50) UNIQUE NOT NULL,            -- 规则ID（唯一标识）
    rule_name VARCHAR(200) NOT NULL,                -- 规则名称
    trigger_type VARCHAR(50) NOT NULL,              -- 触发类型: keyword(关键词), exact(精确匹配), regex(正则)
    trigger_content TEXT NOT NULL,                  -- 触发内容（关键词用逗号分隔）
    response_type VARCHAR(50) NOT NULL,             -- 响应类型: text(文本), dynamic(动态), template(模板)
    response_content TEXT NOT NULL,                 -- 响应内容
    priority INTEGER DEFAULT 5,                     -- 优先级（数字越大优先级越高）
    enabled BOOLEAN DEFAULT true,                   -- 是否启用
    category VARCHAR(100),                          -- 分类
    tags VARCHAR(500),                              -- 标签（用逗号分隔）
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- 创建时间
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- 更新时间
);

-- 创建索引以提高查询性能
CREATE INDEX idx_rule_id ON rulelibtable(rule_id);
CREATE INDEX idx_enabled ON rulelibtable(enabled);
CREATE INDEX idx_priority ON rulelibtable(priority DESC);
CREATE INDEX idx_category ON rulelibtable(category);
CREATE INDEX idx_trigger_type ON rulelibtable(trigger_type);

-- 创建全文搜索索引（用于关键词匹配）
CREATE INDEX idx_trigger_content_gin ON rulelibtable USING gin(to_tsvector('simple', trigger_content));

-- 创建更新时间自动更新的触发器
CREATE OR REPLACE FUNCTION update_updated_time()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_time = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_time
BEFORE UPDATE ON rulelibtable
FOR EACH ROW
EXECUTE FUNCTION update_updated_time();

-- 添加注释
COMMENT ON TABLE rulelibtable IS '聊天机器人规则库表';
COMMENT ON COLUMN rulelibtable.rule_id IS '规则唯一标识ID';
COMMENT ON COLUMN rulelibtable.rule_name IS '规则名称';
COMMENT ON COLUMN rulelibtable.trigger_type IS '触发类型: keyword/exact/regex';
COMMENT ON COLUMN rulelibtable.trigger_content IS '触发内容（多个关键词用逗号分隔）';
COMMENT ON COLUMN rulelibtable.response_type IS '响应类型: text/dynamic/template';
COMMENT ON COLUMN rulelibtable.response_content IS '响应内容';
COMMENT ON COLUMN rulelibtable.priority IS '优先级，数字越大优先级越高';
COMMENT ON COLUMN rulelibtable.enabled IS '是否启用该规则';
COMMENT ON COLUMN rulelibtable.category IS '规则分类';
COMMENT ON COLUMN rulelibtable.tags IS '标签（逗号分隔）';

-- 输出创建成功信息
SELECT 'rulelibtable 表创建成功!' AS status;
