const database = require('./database/connection');
const batdongsan = require('./crawl/batdongsan.com')

database.connect()
batdongsan.crawl()