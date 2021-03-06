const requestUrl = require('../../utils/get-request-url');

Page({
  data: {
    page: 1,
    loading: false,
  },
  viewDetail(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/news-detail/news-detail?id=${id}`,
    });
  },
  getNews(page, needConcat) {
    const that = this;
    const promise = new Promise((resolve) => {
      wx.request({
        url: `${requestUrl}/getNewsList?&page=${page}`,
        header: {
          'Content-Type': 'application/json',
        },
        success(res) {
          let newsData = that.data.newsData || [];
          // let imageList = that.data.imageList || [];
          const resData = res.data;
          if (!needConcat && (!resData || resData.length === 0)) {
            // 第一次加载没有数据
            that.showError(that, '没有拉取到数据~请稍后重试');
            that.setData({
              newsData: [],
            });
            resolve();
            return;
          }
          if (resData.length === 0) {
            // 没有加载到数据
            wx.showToast({
              title: '哥，真没有了...',
              icon: 'success',
              duration: 2000,
            });
            that.setData({
              page: that.data.page - 1,
            });
          } else {
            // const resImageList = resData.map(item => `http://om478cuzx.bkt.clouddn.com/${item.imageName}`);
            if (needConcat) {
              newsData = newsData.concat(resData);
              // imageList = imageList.concat(resImageList);
            } else {
              newsData = resData;
              // imageList = resImageList;
            }
            that.setData({
              newsData,
              // imageList,
            });
          }
          resolve();
        },
        fail(error) {
          that.showError(that, error);
          resolve();
        },
      });
    });
    return promise;
  },
  showError(that, error) {
    if (error) {
      console.error(error);
    }
    wx.showModal({
      content: error || '加载失败，请检查您的网络。',
      confirmText: '重新加载',
      success(res) {
        if (res.confirm) {
          that.getNews();
        }
      },
    });
  },
  onLoad() {
    wx.setNavigationBarTitle({
      title: '教务公告',
    });
    this.getNews();
  },
  onPullDownRefresh() {
    this.getNews().then(() => {
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '拉取数据成功',
        icon: 'success',
        duration: 1000,
      });
    });
  },
  onReachBottom() {
    if (!this.data.loading) {
      this.setData({
        loading: true,
      });
      const newPage = this.data.page + 1;
      this.setData({
        page: newPage,
      });
      this.getNews(newPage, true).then(() => {
        this.setData({
          loading: false,
        });
      });
    }
  },
  onShareAppMessage() {
    return {
      title: '哈理工专属小程序, 教务公告。',
      path: 'pages/news/news',
    };
  },
});
