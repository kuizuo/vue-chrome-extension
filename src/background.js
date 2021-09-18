import axios from 'axios'


browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('Hello from the background')

/*   axios.get(`http://45.125.47.99:3100/v1/goods/1`).then((res)=>{
    console.log(res)
  })
 */
})
