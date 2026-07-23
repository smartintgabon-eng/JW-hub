import * as cheerio from 'cheerio';
import axios from 'axios';
import metascraper from 'metascraper';
import metascraperTitle from 'metascraper-title';

const scraper = metascraper([metascraperTitle()]);

async function test() {
  const url = "https://www.jw.org/fr/biblioth%C3%A8que/revues/tour-de-garde-etude-mars-2024/Des-jeunes-qui-r%C3%A9jouissent-le-c%C5%93ur-de-J%C3%A9hovah/";
  const { data: html } = await axios.get(url);
  const $ = cheerio.load(html);
  
  const meta = await scraper({ html, url });
  
  let extractedTitle = $('header h1').text().trim();
  if (!extractedTitle) extractedTitle = meta.title || "";
  
  console.log("Title found:", extractedTitle);
}

test();
