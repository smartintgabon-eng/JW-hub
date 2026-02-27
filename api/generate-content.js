import { GoogleGenAI } from "@google/genai";
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== 'POST