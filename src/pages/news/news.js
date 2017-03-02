const requestUrl = require('../../utils/get-request-url');

Page({
  data: {
    page: 1,
    loading: false,
  },
  viewImage(event) {
    const index = event.currentTarget.dataset.index;
    const imageList = this.data.imageList || [];
    wx.previewImage({
      current: imageList[index],
      urls: imageList,
      fail() {
        console.error('fail');
      },
    });
  },
  getNews(page, needConcat) {
    const that = this;
    const promise = new Promise((resolve) => {
      wx.request({
        url: `${requestUrl}/api/education/getNews?&page=${page}`,
        header: {
          'Content-Type': 'application/json',
        },
        success(res) {
          let newsData = that.data.newsData || [];
          let imageList = that.data.imageList || [];
          const resData = res.data.data;
          const resImageList = resData.map(item => `http://om478cuzx.bkt.clouddn.com/${item.imageName}?timestamp=${Date.now()}`);

          if (needConcat) {
            newsData = newsData.concat(resData);
            imageList = imageList.concat(resImageList);
          } else {
            newsData = resData;
            imageList = resImageList;
          }

          that.setData({
            newsData,
            imageList,
          });
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
    this.getNews();
  },
  onPullDownRefresh() {
    this.getNews().then(() => {
      wx.stopPullDownRefresh();
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
});