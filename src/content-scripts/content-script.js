// 注意，这里引入的vue是运行时的模块，因为content是插入到目标页面，对组件的渲染需要运行时的vue， 而不是编译环境的vue （我也不知道我在说啥，反正大概意思就是这样）
import Vue from 'vue/dist/vue.esm.js';
import ElementUI, { Message } from 'element-ui';
Vue.use(ElementUI);

// 注意，必须设置了run_at=document_start此段代码才会生效
document.addEventListener('DOMContentLoaded', function() {
  console.log('vue-chrome扩展已载入');

  insertFloat();
});

// 在target页面中新建一个带有id的dom元素，将vue对象挂载到这个dom上。
function insertFloat() {
  let element = document.createElement('div');
  let attr = document.createAttribute('id');
  attr.value = 'appPlugin';
  element.setAttributeNode(attr);
  document.getElementsByTagName('body')[0].appendChild(element);

  let link = document.createElement('link');
  let linkAttr = document.createAttribute('rel');
  linkAttr.value = 'stylesheet';
  let linkHref = document.createAttribute('href');
  linkHref.value = 'https://unpkg.com/element-ui/lib/theme-chalk/index.css';
  link.setAttributeNode(linkAttr);
  link.setAttributeNode(linkHref);
  document.getElementsByTagName('head')[0].appendChild(link);

  let left = 0;
  let top = 0;
  let mx = 0;
  let my = 0;
  let onDrag = false;

  var drag = {
    inserted: function(el) {
      (el.onmousedown = function(e) {
        left = el.offsetLeft;
        top = el.offsetTop;
        mx = e.clientX;
        my = e.clientY;
        if (my - top > 40) return;

        onDrag = true;
      }),
        (window.onmousemove = function(e) {
          if (onDrag) {
            let nx = e.clientX - mx + left;
            let ny = e.clientY - my + top;
            let width = el.clientWidth;
            let height = el.clientHeight;
            let bodyWidth = window.document.body.clientWidth;
            let bodyHeight = window.document.body.clientHeight;

            if (nx < 0) nx = 0;
            if (ny < 0) ny = 0;

            if (ny > bodyHeight - height && bodyHeight - height > 0) {
              ny = bodyHeight - height;
            }

            if (nx > bodyWidth - width) {
              nx = bodyWidth - width;
            }

            el.style.left = nx + 'px';
            el.style.top = ny + 'px';
          }
        }),
        (el.onmouseup = function(e) {
          if (onDrag) {
            onDrag = false;
          }
        });
    },
  };

  window.kz_vm = new Vue({
    el: '#appPlugin',
    directives: {
      drag: drag,
    },
    template: `
      <div class="float-page" ref="float" v-drag>
        <el-card class="box-card" :body-style="{ padding: '15px' }">
          <div slot="header" class="clearfix" style="cursor: move">
            <span>悬浮窗</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="toggle">{{ show ? '收起' : '展开'}}</el-button>
          </div>
          <transition name="ul">
            <div v-if="show" class="ul-box">
              <span> {{user}} </span>
            </div>
          </transition>
        </el-card>
      </div>
      `,
    data: function() {
      return {
        show: true,
        list: [],
        user: {
          username: '',
          follow: 0,
          title: '',
          view: 0,
        },
      };
    },
    mounted() {},
    methods: {
      toggle() {
        this.show = !this.show;
      },
      sendMessage(data) {
        chrome.runtime.sendMessage(data, function(response) {
          console.log('收到来自后台的回复：' + response);
        });
      },
    },
  });
}
