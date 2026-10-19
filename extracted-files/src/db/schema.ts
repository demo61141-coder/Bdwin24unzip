import { pgTable, serial, text, doublePrecision, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  phone: text("phone").notNull().unique(),
  password: text("password").notNull(),
  balance: doublePrecision("balance").notNull().default(500.0),
  bonusBalance: doublePrecision("bonus_balance").notNull().default(50.0),
  commissionBalance: doublePrecision("commission_balance").notNull().default(0.0),
  vipLevel: integer("vip_level").notNull().default(1),
  vipExp: integer("vip_exp").notNull().default(0),
  inviteCode: text("invite_code").notNull().unique(),
  referredBy: text("referred_by"),
  avatar: text("avatar").default("avatar_1"),
  isDemo: boolean("is_demo").default(false),
  isBanned: boolean("is_banned").default(false),
  lastCheckInDate: text("last_check_in_date"),
  checkInStreak: integer("check_in_streak").default(0),
  lastSpinDate: text("last_spin_date"),
  totalDeposited: doublePrecision("total_deposited").default(0.0),
  totalWithdrawn: doublePrecision("total_withdrawn").default(0.0),
  totalBetAmount: doublePrecision("total_bet_amount").default(0.0),
  totalWinAmount: doublePrecision("total_win_amount").default(0.0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // deposit, withdraw, bonus, commission, gift_code, spin_reward, transfer
  amount: doublePrecision("amount").notNull(),
  method: text("method"), // bkash, nagad, rocket, upay, usdt, system
  accountNumber: text("account_number"),
  trxId: text("trx_id"),
  status: text("status").notNull().default("completed"), // pending, completed, rejected
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gameBets = pgTable("game_bets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  gameType: text("game_type").notNull(), // wingo, aviator, slots, dragon_tiger, mines, dice, teen_patti, sports, roulette
  gameId: text("game_id"),
  betAmount: doublePrecision("bet_amount").notNull(),
  winAmount: doublePrecision("win_amount").notNull().default(0),
  multiplier: doublePrecision("multiplier").default(0),
  prediction: text("prediction"),
  outcome: text("outcome"),
  isWin: boolean("is_win").default(false),
  periodNumber: text("period_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wingoHistory = pgTable("wingo_history", {
  id: serial("id").primaryKey(),
  periodNumber: text("period_number").notNull().unique(),
  timerType: text("timer_type").notNull().default("1m"), // 30s, 1m, 3m, 5m
  winningNumber: integer("winning_number").notNull(),
  winningColor: text("winning_color").notNull(), // red, green, violet, red_violet, green_violet
  winningSize: text("winning_size").notNull(), // big, small
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const giftCodes = pgTable("gift_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  amount: doublePrecision("amount").notNull(),
  maxClaims: integer("max_claims").default(1000),
  claimsCount: integer("claims_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userGiftClaims = pgTable("user_gift_claims", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  giftCodeId: integer("gift_code_id").references(() => giftCodes.id, { onDelete: "cascade" }),
  amount: doublePrecision("amount").notNull(),
  claimedAt: timestamp("claimed_at").defaultNow().notNull(),
});

export const sportsMatches = pgTable("sports_matches", {
  id: serial("id").primaryKey(),
  sport: text("sport").notNull(), // cricket, football, tennis
  tournament: text("tournament").notNull(),
  teamA: text("team_a").notNull(),
  teamB: text("team_b").notNull(),
  teamALogo: text("team_a_logo"),
  teamBLogo: text("team_b_logo"),
  oddsA: doublePrecision("odds_a").notNull(),
  oddsDraw: doublePrecision("odds_draw").default(3.2),
  oddsB: doublePrecision("odds_b").notNull(),
  status: text("status").default("live"), // live, upcoming, finished
  score: text("score"),
  startTime: text("start_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  username: text("username").notNull(),
  message: text("message").notNull(),
  isSupport: boolean("is_support").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  bkashNumber: text("bkash_number").notNull().default("01788223344"),
  nagadNumber: text("nagad_number").notNull().default("01899112233"),
  rocketNumber: text("rocket_number").notNull().default("01955443322"),
  upayNumber: text("upay_number").notNull().default("01622334455"),
  usdtAddress: text("usdt_address").notNull().default("TQx7Y2bnWpL8mQ9vZxKrP3sD1fG5hJ4kL8"),
  minDeposit: doublePrecision("min_deposit").notNull().default(100.0),
  minWithdraw: doublePrecision("min_withdraw").notNull().default(110.0),
  depositBonusPercent: doublePrecision("deposit_bonus_percent").notNull().default(5.0),
  welcomeBonus: doublePrecision("welcome_bonus").notNull().default(500.0),
  adminPin: text("admin_pin").notNull().default("admin1234"),
  siteNotice: text("site_notice").notNull().default("BDWIN24 এ স্বাগতম! বিকাশ ও নগদে দ্রুত ডিপোজিটে পান ৫% এক্সট্রা ক্যাশ বোনাস।"),
  isDepositAutoApprove: boolean("is_deposit_auto_approve").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
