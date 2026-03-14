import dotenv from 'dotenv';
import { interpretUserQuery } from './services/geminiInterpreterService.js';
dotenv.config();

async function run() {
  const result = await interpretUserQuery("low stock products");
  console.log(result);
}
run();
