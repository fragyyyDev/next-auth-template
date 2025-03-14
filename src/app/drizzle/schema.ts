import { boolean, pgTable, text, uuid, numeric, timestamp } from "drizzle-orm/pg-core";

// Kurzy
export const coursesTable = pgTable("courses", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    image: text("image").notNull(),
    author: text("author").notNull(),
});

// Sekce v kurzech
export const courseSectionsTable = pgTable("courseSections", {
    id: uuid("id").primaryKey().defaultRandom(),
    courseID: uuid("courseID").notNull().references(() => coursesTable.id),
    name: text("name").notNull(),
    private: boolean("private").notNull(),
});

// Lekce v sekcích
export const lessonsTable = pgTable("lessons", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    content: text("content").notNull(),
    private: boolean("private").notNull(),
});

// Propojení sekcí a lekcí
export const courseSectionLessonsTable = pgTable("courseSectionLessons", {
    courseSectionID: uuid("courseSectionID")
        .notNull()
        .references(() => courseSectionsTable.id),
    lessonID: uuid("lessonID")
        .notNull()
        .references(() => lessonsTable.id),
});

// Uživatelé
export const usersTable = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    profilePicture: text("profilePicture").notNull().default(""),
    password: text("password").notNull().default(""),
    courses_owned: text("courses_owned").array().notNull(),
    customerId: text("customerId").notNull(),
    resetToken: text("resetToken"), // Může být NULL, pokud token není nastaven
    resetTokenExpiry: timestamp("resetTokenExpiry", { mode: "date" }), // Může být NULL, pokud token není nastaven
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(), // Automaticky nastaví aktuální čas
});

// Produkty (balíčky kurzů)
export const productsTable = pgTable("products", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(), // Cena v peněžním formátu (např. 99.99)
});

// Propojení produktů s kurzy (many-to-many)
export const productCoursesTable = pgTable("productCourses", {
    productID: uuid("productID").notNull().references(() => productsTable.id),
    courseID: uuid("courseID").notNull().references(() => coursesTable.id),
});
