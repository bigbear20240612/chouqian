import type { DrawConfig, DrawResult } from "@/types";

/**
 * 抽签引擎 - 核心抽签逻辑
 */

/**
 * 生成指定范围内的随机整数
 * @param min 最小值（包含）
 * @param max 最大值（包含）
 * @returns 随机整数
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 从数组中随机选择一个元素
 * @param array 数组
 * @returns 随机选择的元素
 */
export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * 从数组中随机选择多个不重复的元素
 * @param array 数组
 * @param count 选择数量
 * @returns 随机选择的元素数组
 */
export function randomChoices<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * 数字抽签
 * @param config 抽签配置
 * @param count 抽取数量
 * @returns 抽签结果
 */
export function drawNumber(config: DrawConfig, count = 1): DrawResult {
  const { min = 1, max = 100, allowRepeat = false } = config;

  if (min >= max) {
    throw new Error("最小值必须小于最大值");
  }

  const totalNumbers = max - min + 1;

  if (!allowRepeat && count > totalNumbers) {
    throw new Error(`不允许重复时，最多只能抽取 ${totalNumbers} 个数字`);
  }

  let values: number[];

  if (allowRepeat) {
    // 允许重复
    values = Array.from({ length: count }, () => randomInt(min, max));
  } else {
    // 不允许重复
    const allNumbers = Array.from({ length: totalNumbers }, (_, i) => min + i);
    values = randomChoices(allNumbers, count);
  }

  return {
    value: count === 1 ? values[0] : values,
    timestamp: new Date().toISOString(),
    metadata: { type: "number", min, max, allowRepeat },
  };
}

/**
 * 列表抽签（从预定义列表中抽取）
 * @param config 抽签配置
 * @param count 抽取数量
 * @returns 抽签结果
 */
export function drawFromList(config: DrawConfig, count = 1): DrawResult {
  const { items = [] } = config;

  if (items.length === 0) {
    throw new Error("抽签列表为空");
  }

  if (count > items.length) {
    throw new Error(`抽取数量不能超过列表总数 (${items.length})`);
  }

  const values = randomChoices(items, count);

  return {
    value: count === 1 ? values[0] : values,
    timestamp: new Date().toISOString(),
    metadata: { type: "list", total: items.length },
  };
}

/**
 * 多重抽签（一次执行多次抽签）
 * @param config 抽签配置
 * @param count 抽取次数
 * @returns 抽签结果数组
 */
export function drawMultiple(config: DrawConfig, count: number): DrawResult[] {
  const results: DrawResult[] = [];

  for (let i = 0; i < count; i++) {
    // 判断抽签类型
    if (config.min !== undefined && config.max !== undefined) {
      // 数字抽签
      results.push(drawNumber(config, 1));
    } else if (config.items && config.items.length > 0) {
      // 列表抽签
      results.push(drawFromList({ ...config, items: config.items }, 1));
    } else {
      throw new Error("无效的抽签配置");
    }
  }

  return results;
}

/**
 * 执行抽签（根据配置自动选择抽签方式）
 * @param config 抽签配置
 * @param count 抽取数量
 * @returns 抽签结果
 */
export function executeDraw(config: DrawConfig, count = 1): DrawResult {
  // 判断抽签类型
  if (config.min !== undefined && config.max !== undefined) {
    // 数字抽签
    return drawNumber(config, count);
  } else if (config.isPoem) {
    // 诗词抽签 - 使用预置诗词库
    const poemConfig = {
      ...config,
      items: PRESET_POEMS.map((p) => `${p.title} - ${p.author}\n${p.content}`),
    };
    return drawFromList(poemConfig, count);
  } else if (config.items && config.items.length > 0) {
    // 列表抽签
    return drawFromList(config, count);
  } else {
    throw new Error("无效的抽签配置");
  }
}

/**
 * 预置的诗词数据
 */
export const PRESET_POEMS = [
  { title: "静夜思", author: "李白", content: "床前明月光，疑是地上霜。举头望明月，低头思故乡。" },
  { title: "春晓", author: "孟浩然", content: "春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。" },
  { title: "登鹳雀楼", author: "王之涣", content: "白日依山尽，黄河入海流。欲穷千里目，更上一层楼。" },
  { title: "江雪", author: "柳宗元", content: "千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。" },
  { title: "相思", author: "王维", content: "红豆生南国，春来发几枝。愿君多采撷，此物最相思。" },
  { title: "悯农", author: "李绅", content: "锄禾日当午，汗滴禾下土。谁知盘中餐，粒粒皆辛苦。" },
  { title: "咏鹅", author: "骆宾王", content: "鹅鹅鹅，曲项向天歌。白毛浮绿水，红掌拨清波。" },
  { title: "春夜喜雨", author: "杜甫", content: "好雨知时节，当春乃发生。随风潜入夜，润物细无声。" },
  { title: "游子吟", author: "孟郊", content: "慈母手中线，游子身上衣。临行密密缝，意恐迟迟归。" },
  { title: "回乡偶书", author: "贺知章", content: "少小离家老大回，乡音无改鬓毛衰。儿童相见不相识，笑问客从何处来。" },
];

/**
 * 预置的学生姓名示例
 */
export const PRESET_NAMES = [
  "张小明", "李华", "王芳", "赵强", "刘洋",
  "陈静", "杨帆", "黄丽", "周杰", "吴敏",
  "徐涛", "孙娜", "胡伟", "朱丽", "高飞",
  "林峰", "何秀", "郭强", "马丽", "罗杰",
];

/**
 * 创建预置项目配置
 */
export function createPresetProjectConfig(type: "number" | "name" | "poem" | "custom") {
  switch (type) {
    case "number":
      return {
        min: 1,
        max: 100,
        allowRepeat: true,
        drawCount: 1,
      } as DrawConfig;

    case "name":
      return {
        items: PRESET_NAMES,
        drawCount: 1,
      } as DrawConfig;

    case "poem":
      return {
        items: PRESET_POEMS.map((p) => `${p.title} - ${p.author}\n${p.content}`),
        drawCount: 1,
      } as DrawConfig;

    case "custom":
      return {
        items: [],
        drawCount: 1,
      } as DrawConfig;

    default:
      return {
        drawCount: 1,
      } as DrawConfig;
  }
}
