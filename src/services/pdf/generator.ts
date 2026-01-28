// import puppeteer from 'puppeteer' 
// Note: puppeteer-core or playwright recommended for serverless environments

export async function generateInvoicePDF(htmlContent: string): Promise<Buffer> {
  console.log("Generating PDF for content length:", htmlContent.length)
  
  // Mock implementation
  // In real app:
  // const browser = await puppeteer.launch()
  // const page = await browser.newPage()
  // await page.setContent(htmlContent)
  // const pdf = await page.pdf({ format: 'A4' })
  // await browser.close()
  // return pdf

  return Buffer.from("Mock PDF Content")
}
