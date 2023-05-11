const axios = require('axios');
// const http = require('http');
const cheerio = require('cheerio');
const j2cp = require('json2csv').Parser;
const fs = require('fs');
const { default: performScraping } = require('.');

const url = "https://books.toscrape.com/catalogue/category/books/mystery_3/index.html";
const baseUrl = "https://books.toscrape.com/catalogue/category/books/mystery_3/";

const books_data = [];

async function getBooks(url){
    try {
        const response = await axios.get(url);

        const $ = cheerio.load(response.data);

        const books = $('article');
        books.each(function(){
            title = $(this).find("h3 a").text();
            price = $(this).find(".price_color").text();
            available = $(this).find(".availability").text().trim();

            books_data.push({title, price, available})
        });

        // handling next button on the page 
        if($('.next a').length > 0){
            next_page = baseUrl + $('.next a').attr('href');
            getBooks(next_page)
        }else{
            // From here, create the file because the books_data will now have all the data.
            const parser = new j2cp();
            const csv = parser.parse(books_data);
            fs.writeFileSync('./books.csv', csv);
        }
        // console.log(books_data)
    } catch (error) {
        console.error(error);
    }
}

getBooks(url)
// performScraping(url)