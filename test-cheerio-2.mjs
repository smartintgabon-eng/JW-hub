import * as cheerio from 'cheerio';
import axios from 'axios';

async function test() {
  const url = "https://www.jw.org/fr/biblioth%C3%A8que/revues/tour-de-garde-etude-mars-2024/Des-jeunes-qui-r%C3%A9jouissent-le-c%C5%93ur-de-J%C3%A9hovah/";
  const { data: html } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    }
  });
  const $ = cheerio.load(html);
  
  let extractedTitle = $('header h1').text().trim();
  console.log("Title found:", extractedTitle);
}

test();
