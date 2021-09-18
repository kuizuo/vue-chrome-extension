function getInfo() {
  let username = $('#v_upinfo > div.up-info_right > div.name > a.username')
    .text()
    .trim();
  let follow = $(`#v_upinfo > div.up-info_right > div.btn-panel > div.default-btn.follow-btn.btn-transition.b-gz.following > span > span > span`).text();
  let title = $(`#viewbox_report > h1 > span`).text();
  let view = $('#viewbox_report > div > span.view').attr('title');

  console.log(username, follow, title, view);
  window.kz_vm.user = {
    username,
    follow,
    title,
    view,
  };

   window.kz_vm.sendMessage(window.kz_vm.user);
}

function comment() {
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    let { cmd, message } = request;
    if (cmd === 'addComment') {
      $('#comment > div > div.comment > div > div.comment-send > div.textarea-container > textarea').val(message);
      $('#comment > div > div.comment > div > div.comment-send > div.textarea-container > button').click();
    }

    sendResponse('我收到了你的消息！');
  });
}

window.onload = function() {
  console.log('content加载完毕');

  getInfo();
  comment();
};
