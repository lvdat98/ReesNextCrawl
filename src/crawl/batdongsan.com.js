const moment = require('moment');
const pup = require('puppeteer')
const Content = require('../database/models/Content')
const Website = require('../database/models/Website')


const nhaBan = "https://batdongsan.com.vn/ban-nha-dat-da-nang";
const datBan = "https://batdongsan.com.vn/ban-dat-dat-nen-da-nang";
const delay = (t, v) =>
  new Promise(function (resolve) {
    setTimeout(resolve.bind(null, v), t);
  });

const crawl = async () => {
  const webscraping = async () => {
    const contentlinks = []
    const browser = await pup.launch({
      headless: false,
      args: ['--no-sandbox']
    });
    try {
      const website = await Website.findOne({type: 'BATDONGSANVN'})
      const page = await browser.newPage();
      // get link nha ban
      await page.goto(nhaBan);
      await page.click('.fr')
      const [button] = await page.$x("//ul[@class='re__dropdown-no-art--sm advance-options']//li[contains(., 'Tin mới nhất')]");
      await button.click();
      await delay(3000);
      await getAllLink(page, contentlinks, website.lastCrawDate)
      // get link dat ban
      await page.goto(datBan);
      await page.click('.fr')
      const [button2] = await page.$x("//ul[@class='re__dropdown-no-art--sm advance-options']//li[contains(., 'Tin mới nhất')]");
      await button2.click();
      await delay(3000);
      await getAllLink(page, contentlinks, website.lastCrawDate)
      console.log(contentlinks)

      for (const link of contentlinks) {
        const content = await getContent(page, link);
        console.log(content)
        await Content.create(content)
      }
    }
    catch (e) {
      console.log(e)
      //browser.close()
    }
    //browser.close()
  }
  webscraping().catch(console.error)

}

const getLinkInPage = async (page, isLastPage, lastCrawDate) => {
  let links = []
  const contentLink = await page.$$('.wrap-plink');
  for (const link of contentLink) {
    const publishDate = await link.$eval('.tooltip-time', node => node.textContent.trim())
    if (moment(new Date(publishDate)).format('MM/DD/YYYY') < moment(lastCrawDate).format('DD/MM/YYYY')) {
      isLastPage.isLastPage = true
      break;
    } else {
      links.push(await link.getProperty('href'))
    }
  }
  links = await Promise.all(
    links.map(handle => handle.jsonValue())
  );
  return links
}


const nextPage = async (page) => {
  const activePage = await page.$('.re__pagination--actived');
  const next = await page.evaluateHandle(el => el.nextElementSibling, activePage);
  await next.click();
  await page.waitForNavigation({ waitUntil: 'networkidle0' })
  await delay(1000);
}

const getAllLink = async (page, contentlinks, lastCrawDate) => {
  const isLastPage = { isLastPage: false };
  while (isLastPage.isLastPage === false) {
    const links = await getLinkInPage(page, isLastPage, lastCrawDate)
    contentlinks.push(...links)
    await nextPage(page)
  }
}

getContent = async (page, url) => {
  await page.goto(url);
  const content = {}
  content.type= 'BATDONGSANVN';
  content.url = url;
  content.title = await page.$eval('.pr-title', node => node.textContent.trim())
  content.address = await page.$eval('.box-round-grey3 > div:nth-child(2) > .r2', node => node.textContent.trim())
  content.totalPrice = await page.$eval('.short-detail-2 > li:first-child > .sp2', node => node.textContent.trim())
  content.acreage = await page.$eval('.short-detail-2 > li:last-child > .sp2', node => node.textContent.trim())
  content.publishDate = await page.$eval('.short-detail-2 > li:first-child > .sp3', node => node.textContent.trim())
  content.expirationDate = await page.$eval('.short-detail-2 > li:nth-child(2) > .sp3', node => node.textContent.trim())
  content.type = await page.$eval('.short-detail-2 > li:nth-child(3) > .sp3', node => node.textContent.trim())
  content.description = await page.$eval('.des-product', node => node.innerHTML.trim())
  content.phone = await page.$eval('.hidden-mobile', node => node.getAttribute('raw'))
  const keyWords = await page.$$('.ul-round > li')
  content.keyWords = await Promise.all(
    keyWords.map(async x => {
      return x.evaluate(node => node.innerText);
    })
  )
  const images = await page.$$('.size-slide > a')
  content.images = await Promise.all(
    images.map(async x => {
      const image = await x.evaluate((y) => {
        return JSON.parse(JSON.stringify(getComputedStyle(y).backgroundImage));
      });
      return image.substring(5, image.length - 2)
    })
  )
  return content
}



exports.crawl = crawl


