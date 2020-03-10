//导入socket.js和utils文件
var websocket = require('../../utils/websocket.js');
var utils = require('../../utils/util.js');
//微信小程序官方提供了全局的getApp()函数，可以获取到小程序实例。
const app = getApp()

//Page() 函数用来注册一个页面。接受一个 object 参数，其指定页面的初始数据、生命周期函数、事件处理函数等。
Page({
  //页面数据,可以通过this.data[propName]访问
  data: {
    text: "",
    title: "标题",
    userInfo: {},
    messages: [],
    animation: {},
    animation_2: {},
    tap: "tapOff",
    height: 0,
    scrollTop: 0,
    msg: '',
    //more为选择图片/发送消息的按钮的样式变量，默认为选择图片样式
    more: 'ion-ios-plus-outline',
    moreBox: false,
    toView: 'scrollBottom'
  },

  //页面初始化 options为页面跳转所带来的参数
  onLoad: function (options) {
    let that = this
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
    //调通接口
    websocket.connect(this.data.userInfo, function (res) {
      //console.log(JSON.parse(res.data))
      let list = []
      list = that.data.messages
      //data.me = (data.peopleId == app.globalData.userInfo.nickName) ? true : false
      list.push(JSON.parse(res.data))
      console.log(list)
      that.setData({
        messages: list
      })
      //console.log(messages.content)
    })

    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          height: res.windowHeight
        })
      }
    })

  },

  onReady() {
    // 页面渲染完成
    this.animation = wx.createAnimation();
    this.animation_2 = wx.createAnimation()
  },

  // 页面卸载
  onUnload: function () {
    wx.closeSocket();
    wx.showToast({
      title: '连接已断开~',
      icon: "none",
      duration: 2000
    })

  },

  //事件处理函数
  //input输入框绑定的事件
  sendMessage(e) {
    this.setData({
      //e.detail.value可以动态获取input输入框中的值，存入msg变量中
      msg: e.detail.value,
      //这是一个if函数，判断e.detail.value中的值是否为空，
      //不为空时（选择条件为真）则令more='ion-ios-send'，为空时more='ion-ios-plus-outline'
      more: (e.detail.value) ? 'ion-ios-send' : 'ion-ios-plus-outline'
    })
  },
  //选择图片/发送消息的按钮事件
  elseBtn: function () {
    //如果是发送消息的按钮，就执行下列操作
    if (this.data.more == 'ion-ios-send') {
      //先在控制台输出消息
      console.log(this.data.msg)
      //通过websocket把消息内容发送到服务器端
      websocket.send(
        {
          date: utils.formatTime(new Date()),
          peopleId: this.data.userInfo.nickName,
          type: 'text',
          content: this.data.msg,
          avatarUrl: this.data.userInfo.avatarUrl,
        })
      //发完消息之后清空msg变量中的值，并把发送消息按钮转换为选择图片按钮
      this.setData({
        msg: '',
        more: 'ion-ios-plus-outline'
      })
      //描述动画效果并通过.export()方法赋值到animation_2变量中。
      //这里的动画效果是高度可滚动视图区域-30
      this.animation_2.height(this.data.height - 40).step();
      this.setData({
        animation_2: this.animation_2.export()
      })
      this.setData({
        tap: "tapOff"
      })
      return
    }
    this.setData({
      //判断相册盒子是否出现
      moreBox: (this.data.tap == 'tapOff') ? true : false
    })
    if (this.data.tap == "tapOff") {
      this.animation_2.height(this.data.height - 120).step();
      this.setData({
        animation_2: this.animation_2.export()
      })
      this.setData({
        tap: "tapOn"
      })
    } else {
      this.animation_2.height(this.data.height - 40).step();
      this.setData({
        animation_2: this.animation_2.export()
      })
      this.setData({
        tap: "tapOff"
      })
    }
  },
  //选择图片事件
  chooseImg() {
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: (result) => {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        var t = this.data.message;
        t.push({
          img: this.data.userInfo.avatarUrl,
          imgList: tempFilePaths,
          me: true
        })
        this.setData({
          message: t
        })
      },
    });
  }
});