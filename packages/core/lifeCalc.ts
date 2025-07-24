import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

// 兼容 ESM 环境获取当前目录
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export type Sex = "male" | "female";

export interface PredictionResult {
  baseRemainingYears: number; // 使用寿命表 & Gompertz 的基础剩余年数
  adjustedYears: number; // 预留扩展（延寿因子）
  predictedDateOfDeath: Date;
}

const TABLE_PATH = path.resolve(__dirname, "data", "ssa2022.json");

// 懒加载并缓存
type LifeTable = { male: number[]; female: number[] };
let lifeTableCache: LifeTable | undefined;
function getLifeTable(): LifeTable {
  if (lifeTableCache) return lifeTableCache;
  try {
    const raw = fs.readFileSync(TABLE_PATH, "utf-8");
    lifeTableCache = JSON.parse(raw);
  } catch (err) {
    // 若文件不存在则回退极简常数表，避免构建失败
    const defaultArr = Array.from({ length: 121 }, () => 0.008);
    lifeTableCache = { male: defaultArr, female: defaultArr };
  }
  return lifeTableCache!;
}

// 简易伪随机生成器（Mulberry32）
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sha256Seed(input: string): number {
  const hash = crypto.createHash("sha256").update(input).digest();
  // 取前 4 字节为种子
  return hash.readUInt32BE(0);
}

export function computeRemainingYears(
  dob: Date,
  sex: Sex,
  seedStr: string
): number {
  const table = getLifeTable()[sex]!;
  const today = new Date();
  const ageYears =
    (today.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  const ageFloor = Math.floor(ageYears);
  let remainingYears = 0;

  // 基于寿命表逐年模拟
  let rng = mulberry32(sha256Seed(seedStr));
  for (let age = ageFloor; age < table.length; age++) {
    const qx = table[age];
    const random = rng();
    if (random < qx) {
      break; // 死亡发生在该年龄区间
    }
    remainingYears += 1;
  }
  return remainingYears;
}

export function predictDeathDate(
  dob: Date,
  sex: Sex,
  userUid: string,
  secretSalt = "moreminutes_secret"
): PredictionResult {
  const baseRemainingYears = computeRemainingYears(
    dob,
    sex,
    `${userUid}${dob.toISOString()}${secretSalt}`
  );

  // MVP 暂无 adjustedYears 逻辑，保持一致
  const adjustedYears = baseRemainingYears;
  const predictedDateOfDeath = new Date(dob);
  predictedDateOfDeath.setFullYear(
    predictedDateOfDeath.getFullYear() + adjustedYears
  );
  return { baseRemainingYears, adjustedYears, predictedDateOfDeath };
} 