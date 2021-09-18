// 注意，这里引入的vue是运行时的模块，因为content是插入到目标页面，对组件的渲染需要运行时的vue， 而不是编译环境的vue （我也不知道我在说啥，反正大概意思就是这样）
import Vue from 'vue/dist/vue.esm.js';
import ElementUI, { Message } from 'element-ui';
import HelloWorld from '@/components/HelloWorld.vue';
Vue.use(ElementUI);

// 注意，必须设置了run_at=document_start此段代码才会生效
document.addEventListener('DOMContentLoaded', function() {
  console.log('vue-chrome扩展已载入');

  insertSideBar();
  // Message.success('ok');
});

// v-dialogDrag: 弹窗拖拽
Vue.directive('dialogDrag', {
  bind(el, binding, vnode, oldVnode) {
    const dialogHeaderEl = el.querySelector('.el-dialog__header');
    const dragDom = el.querySelector('.el-dialog');
    dialogHeaderEl.style.cursor = 'move';

    // 获取原有属性 ie dom元素.currentStyle 火狐谷歌 window.getComputedStyle(dom元素, null);
    const sty = dragDom.currentStyle || window.getComputedStyle(dragDom, null);

    dialogHeaderEl.onmousedown = (e) => {
      // 鼠标按下，计算当前元素距离可视区的距离
      const disX = e.clientX - dialogHeaderEl.offsetLeft;
      const disY = e.clientY - dialogHeaderEl.offsetTop;

      // 获取到的值带px 正则匹配替换
      let styL, styT;

      // 注意在ie中 第一次获取到的值为组件自带50% 移动之后赋值为px
      if (sty.left.includes('%')) {
        styL = +document.body.clientWidth * (+sty.left.replace(/\%/g, '') / 100);
        styT = +document.body.clientHeight * (+sty.top.replace(/\%/g, '') / 100);
      } else {
        styL = +sty.left.replace(/\px/g, '');
        styT = +sty.top.replace(/\px/g, '');
      }

      document.onmousemove = function(e) {
        // 通过事件委托，计算移动的距离
        const l = e.clientX - disX;
        const t = e.clientY - disY;

        // 移动当前元素
        dragDom.style.left = `${l + styL}px`;
        dragDom.style.top = `${t + styT}px`;

        //将此时的位置传出去
        //binding.value({x:e.pageX,y:e.pageY})
      };

      document.onmouseup = function(e) {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
  },
});

// v-dialogDragWidth: 弹窗宽度拖大 拖小
Vue.directive('dialogDragWidth', {
  bind(el, binding, vnode, oldVnode) {
    const dragDom = binding.value.$el.querySelector('.el-dialog');

    el.onmousedown = (e) => {
      // 鼠标按下，计算当前元素距离可视区的距离
      const disX = e.clientX - el.offsetLeft;

      document.onmousemove = function(e) {
        e.preventDefault(); // 移动时禁用默认事件

        // 通过事件委托，计算移动的距离
        const l = e.clientX - disX;
        dragDom.style.width = `${l}px`;
      };

      document.onmouseup = function(e) {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
  },
});

// 在target页面中新建一个带有id的dom元素，将vue对象挂载到这个dom上。
function insertSideBar() {
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

  const vue = new Vue({
    el: '#appPlugin',
    components: { HelloWorld },
    template: `
      <div class="float-page">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>卡片名称</span>
              <el-button style="float: right; padding: 3px 0" type="text" >操作按钮</el-button>
            </div>
            <div v-for="o in 4" :key="o" class="text item">
              {{'列表内容 ' + o }}
            </div>
           </el-card>
      </div>
      `,
    data: function() {
      return { color1: null, color2: null, documentArr: [], textArr: [], isOcContentPopShow: true };
    },
    watch: {
      color1(val) {
        let out = document.getElementById('oc_content_page');
        let outC = document.getElementsByClassName('el-color-picker__panel');
        this.documentArr.forEach((item) => {
          if (!out.contains(item) && !outC[0].contains(item) && !outC[1].contains(item)) {
            item.style.cssText = `background-color: ${val}!important;color: ${this.color2}!important;`;
          }
        });
      },
      color2(val) {
        let out = document.getElementById('oc_content_page');
        let outC = document.getElementsByClassName('el-color-picker__panel')[1];
        this.textArr.forEach((item) => {
          if (!out.contains(item) && !outC.contains(item)) {
            item.style.cssText = `color: ${val}!important;`;
          }
        });
      },
    },
    mounted() {
      chrome.runtime.onConnect.addListener((res) => {
        if (res.name === 'testPlugin') {
          res.onMessage.addListener((mess) => {
            this.isOcContentPopShow = true;
          });
        }
      });
      this.$nextTick(() => {
        let bodys = [...document.getElementsByTagName('body')];
        let headers = [...document.getElementsByTagName('header')];
        let divs = [...document.getElementsByTagName('div')];
        let lis = [...document.getElementsByTagName('li')];
        let articles = [...document.getElementsByTagName('article')];
        let asides = [...document.getElementsByTagName('aside')];
        let footers = [...document.getElementsByTagName('footer')];
        let navs = [...document.getElementsByTagName('nav')];
        this.documentArr = bodys.concat(headers, divs, lis, articles, asides, footers, navs);

        let as = [...document.getElementsByTagName('a')];
        let ps = [...document.getElementsByTagName('p')];
        this.textArr = as.concat(ps);
      });
    },
    methods: {
      close() {
        this.isOcContentPopShow = false;
      },
    },
  });
}
