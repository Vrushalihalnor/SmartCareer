import mysql from "mysql2/promise";

export const db = mysql.createPool({
 host: "localhost",
    user: "root",
    password: "vrushali@15",
  database: "dgsmartapp"
});
