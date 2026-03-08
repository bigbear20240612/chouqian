import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../lib/db/schema';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL 环境变量未设置');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function seed() {
  console.log('🌱 开始初始化数据库...\n');

  // 插入预置项目
  const projects = [
    {
      name: '数字抽签示例',
      description: '从1到100中随机抽取数字',
      type: 'number',
      config: { min: 1, max: 100, allowRepeat: true, drawCount: 1 },
      uiStyle: 'card',
    },
    {
      name: '学生姓名抽签',
      description: '从班级学生名单中随机抽取',
      type: 'name',
      config: {
        items: ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'],
        drawCount: 1,
      },
      uiStyle: 'card',
    },
    {
      name: '诗词抽签',
      description: '随机抽取一首经典诗词',
      type: 'poem',
      config: {
        drawCount: 1,
      },
      uiStyle: 'stick',
    },
  ];

  for (const project of projects) {
    try {
      const result = await db
        .insert(schema.drawProjects)
        .values(project)
        .returning();
      console.log(`✅ 创建项目: ${project.name} (ID: ${result[0].id})`);
    } catch (error) {
      console.error(`❌ 创建项目失败: ${project.name}`, error);
    }
  }

  console.log('\n🎉 数据库初始化完成！');
  process.exit(0);
}

seed().catch((error) => {
  console.error('初始化失败:', error);
  process.exit(1);
});
