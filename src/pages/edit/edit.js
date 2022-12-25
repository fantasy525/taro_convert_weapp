import {
    BASE_URL
} from "@/config/config";
import {
    useModel
} from "@/utils/useModel";
import http from "@/utils/http";
import {
    checkPhone,
    Message
} from "@/utils/utils";
// 营业时间模式
const BusinessTimeMode = {
    Custom: 'custom',
    Standard: 'standard'
};

// 门脸照最多限制
const MaxPhotosLimit = 9;
// 页面类型
export const PageType = {
    Add: 'add', // 新增
    Edit: 'edit' // 编辑
};

// 页面标题
export const NavigationBarTitle = {
    [PageType.Add]: '新增地点',
    [PageType.Edit]: '修改地点',
};



Page({
    data: {
        BusinessTimeMode,
        MaxPhotosLimit,
        PageType,
        pageType: '', // PageType
        type: {},
        originType: {},
        form: {
            type: '', // 行业
            name: '', // poi名称
            point: '', // BD09LL 经纬度
            lng: '', // 经度
            lat: '', // 纬度
            photos: [], // 门脸或招牌照片
            status: '', // 营业状态
            phone: '', // 电话
            address: '', // poi地址
            shophourMode: BusinessTimeMode.Custom, // 营业时间模式（自定义/标准）
            shophourStandard: [], // 营业时间模式（标准）
            shophourCustom: '', // 营业时间（自定义）
            busstate: '', // 排队情况
            city: '', // 城市
            winNumber: '', // 窗口数量
            tip: '' // 提示
        },
        canSubmit: false
    },
    mapPageLock: false,
    bindPickerChange() {
        console.log(this)
    },

    /**
     * 初始化模板类型列表
     */
    initType() {
        http.get({
            url: '/tp/miniapp/getmappping',
            data: {
                m_type: 'miniapp_type'
            },
        }).then(res => {
            if (res.code) {
                Message.showToast(res.msg);
                return
            }
            if (res.data.code !== 200) {
                Message.showToast(res.data.message);
                return
            }
            this.setData({
                originType: res.data.data.m_mapping,
                type: Object.keys(res.data.data.m_mapping).map(v => {
                    return {
                        key: +v,
                        value: res.data.data.m_mapping[+v]
                    }
                })
            });
        });
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {
        return {
            title: 'POI上报小工具',
            path: '/packageTP/pages/tp/index',
        };
    },

    /**
     * 地图页
     */
    goMap() {
        if (this.mapPageLock) {
            return;
        };
        this.mapPageLock = true;
        let url = '/packageTP/pages/map/index?target=location';
        let ctx = this;
        wx.getLocation({
            type: 'wgs84',
            success(res) {
                const {
                    longitude,
                    latitude
                } = res;
                const {
                    form
                } = ctx.data;
                const location = `lng=${longitude}&lat=${latitude}&poiLng=${form.lng}&poiLat=${form.lat}`;
                url = url + '&' + location;
                wx.navigateTo({
                    url
                });
            },
            fail() {
                wx.navigateTo({
                    url
                });
            }
        });
    },
    /**
     * 照片添加
     */
    addPhoto() {
        const {
            form
        } = this.data;
        const currentCount = form.photos.length;
        wx.chooseMedia({
            count: MaxPhotosLimit - currentCount, // 可添加图片数量
            mediaType: ['image'],
            sourceType: ['album', 'camera'],
            camera: 'back',
            success: (res) => {
                res.tempFiles.forEach(item => {
                    wx.uploadFile({
                        filePath: item.tempFilePath,
                        name: 'photo',
                        url: BASE_URL + '/tp/miniapp/fileupload',
                        success: (response) => {
                            const res = JSON.parse(response.data).data;
                            if (res.code === 200) {
                                item.bosPath = res.data.pic_url;
                                form.photos.push(item);
                                this.setData({
                                    form
                                }, () => {
                                    this.setSubmitBtnStatus();
                                });
                            } else {
                                wx.showToast({
                                    title: res.message,
                                    icon: 'none',
                                    duration: 2000,
                                    mask: true
                                });
                            }
                        },
                        fail(err) {
                            wx.showToast({
                                title: err.errMsg,
                                icon: 'none',
                                duration: 2000,
                                mask: true
                            });
                        }
                    });
                });
            }
        });
    },

    /**
     * 照片删除
     */
    deletePhoto(event) {
        const index = event.currentTarget.dataset.photoIndex;
        // 删除
        const {
            form
        } = this.data;
        form.photos.splice(index, 1);
        this.setData({
            form
        }, () => {
            this.setSubmitBtnStatus();
        });
    },

    /**
     * 照片预览
     */
    previewPhoto(e) {
        const url = e.currentTarget.dataset.photoUrl;
        wx.previewImage({
            current: url,
            urls: [url],
        });
    },

    /**
     * 切换营业时间模式
     */
    switchBusinessTimeMode() {
        const {
            form
        } = this.data;
        form.shophourMode = form.shophourMode === BusinessTimeMode.Custom ?
            BusinessTimeMode.Standard :
            BusinessTimeMode.Custom;
        // 全部清空
        form.shophourStandard = [];
        form.shophourCustom = '';
        this.setData({
            form
        }, () => {
            // 切换为标准模式时，默认添加一组营业时间
            if (form.shophourMode === BusinessTimeMode.Standard) {
                this.addShophour();
            }
        });
    },
    validteEmpty() {
        const {
            form
        } = this.data;
        return !form.type || !form.name || !form.point || !form.photos.length ||
            !form.status ||
            !form.address;
    },
    setSubmitBtnStatus() {
        this.setData({
            canSubmit: !this.validteEmpty()
        });
    },
    /**
     * 校验
     */
    validtor() {
        const {
            form
        } = this.data;
        // 必填项校验
        if (
            this.validteEmpty()
        ) {
            wx.showToast({
                title: '必填项不能为空',
                icon: 'none'
            });
            return false;
        }
        // 电话存在时校验
        if (form.phone && !checkPhone(form.phone)) {
            wx.showToast({
                title: '电话不合法',
                icon: 'none'
            });
            return false;
        }
        // 营业时间 - 标准模式
        if (form.shophourMode === BusinessTimeMode.Standard) {
            const isFilled = form.shophourStandard.every(item => {
                const condition1 = item.weekStart && item.timeStart;
                const condition2 = !item.weekStart && !item.timeStart;
                // 全部未填写 或 全部填写均可通过
                return condition1 || condition2;
            });
            if (!isFilled) {
                wx.showToast({
                    title: '营业时间不完整',
                    icon: 'none'
                });
                return false;
            }
        }
        return true;
    },

    /**
     * 提交（doc:https://yapi.baidu-int.com/project/22573/interface/api/1711523）
     */
    formSubmit() {
        const {
            form: form2
        } = this.data;
        const isPass = this.validtor();
        if (!isPass) {
            return;
        }
        const {
            form
        } = this.data;
        // 格式化时间
        const shophourStandard = form.shophourStandard
            .filter(item => (item.weekStart && item.timeStart))
            .map(item => (`${item.weekStart}-${item.weekEnd} ${item.timeStart}-${item.timeEnd}`))
            .join(',');
        const shophour = form.shophourMode === BusinessTimeMode.Standard ? shophourStandard : form.shophourCustom;
        const params = {
            type: form.type,
            name: form.name, // 名称
            address: form.address, // 地址
            city: form.city, // 城市
            point_x: form.lng, // 经度
            point_y: form.lat, // 纬度
            coord: 'BD09LL', // BD09LL 仅支持百度经纬度
            status: form.status, // poi状态  1：正常营业  2：永久关闭  3：暂停营业
            shophour: shophour, // 营业时间
            phone: form.phone, // 电话
            // 扩展字段
            Ext: JSON.stringify([{
                    key: 'busstate',
                    value: form.busstate,
                    desc: '排队拥堵程度'
                },
                {
                    key: 'winNum',
                    value: form.winNumber,
                    desc: '窗口数量'
                },
                {
                    key: 'tip',
                    value: form.tip,
                    desc: '备注'
                },
                {
                    key: 'tp_pic_arr',
                    value: form.photos.map(item => item.bosPath),
                    desc: 'tp小程序用户上报图片'
                }
            ])
        };
        http.get({
            url: '/tp/miniapp/submit',
            data: params,
        }).then(response => {
            const {
                code,
                message
            } = response;
            if (code === 200) {
                wx.showToast({
                    title: '提交成功',
                    icon: 'success',
                    duration: 2000
                });
                setTimeout(() => {
                    wx.reLaunch({
                        url: '/packageTP/pages/index/index',
                    });
                }, 2000);
            } else {
                wx.showToast({
                    title: message,
                    icon: 'none',
                    duration: 2000
                });
            }
        });
    },

    /**
     * 更新表单值
     */
    handleFormChange(e) {
        const key = e.currentTarget.dataset.field;
        const index = e.detail.value;
        const {
            form
        } = this.data;
        form[key] = this.data.type[index].key;
        // 行业变化时清空个性化字段
        if (key === 'type') {
            form.busstate === '';
            form.winNumber === '';
            form.tip === '';
        }
        this.setData({
            form
        }, () => {
            console.log(this.data)
            this.setSubmitBtnStatus();
        });
    },

    /**
     * 添加时间段
     */
    addShophour() {
        const {
            form
        } = this.data;
        if (form.shophourStandard.length) {
            const isAllFilled = form.shophourStandard.every(
                item => (item.weekStart && item.weekEnd && item.timeStart && item.timeEnd)
            );
            // 已添加的时间段未全部填充则提示
            if (!isAllFilled) {
                wx.showToast({
                    title: '请将已有时间段补充完整',
                    icon: 'none'
                });
                return;
            }
        }
        form.shophourStandard.push({
            id: identifier(10), // 添加识别符作为key，否则会导致删除后渲染结果混乱
            weekStart: '',
            weekEnd: '',
            timeStart: '',
            timeEnd: ''
        });
        this.setData({
            form
        });
    },

    /**
     * 删除时间段
     */
    deleteShophour(e) {
        const index = e.currentTarget.dataset.index;
        const {
            form
        } = this.data;
        form.shophourStandard.splice(index, 1);
        this.setData({
            form
        });
    },

    /**
     * 监听星期改变
     */
    bindWeekChange(e) {
        const {
            start,
            end
        } = e.detail;
        const index = e.currentTarget.dataset.index;
        const {
            form
        } = this.data;
        const period = form.shophourStandard[index];
        period.weekStart = start;
        period.weekEnd = end;
        this.setData({
            form
        });
    },

    /**
     * 监听时间改变
     */
    bindTimeChange(e) {
        const {
            startH,
            startM,
            endH,
            endM
        } = e.detail;
        const index = e.currentTarget.dataset.index;
        const {
            form
        } = this.data;
        const period = form.shophourStandard[index];
        period.timeStart = `${startH}:${startM}`;
        period.timeEnd = `${endH}:${endM}`;
        this.setData({
            form
        });
    },
    /**
     * 初始数据
     */
    onShow() {
        this.mapPageLock = false;
    },
    /**
     * 页面加载
     */
    onLoad(options) {
        // 初始化页面类型
        const pageType = options.pageType || '';
        this.setData({
            pageType
        });
        this.mapPageLock = false;
        // 动态设置页面标题
        const title = NavigationBarTitle[pageType];
        wx.setNavigationBarTitle({
            title
        });
        // 初始化行业类型
        this.initType();
        // 修改地点初始化原始POI信息
        if (pageType === PageType.Edit) {
            const {
                form
            } = this.data;
            if (options.address) {
                form.address = options.address;
            }
            if (options.city) {
                form.city = options.city;
            }
            if (options.lat && options.lng) {
                form.lat = options.lat;
                form.lng = options.lng;
                form.point = `${options.lng},${options.lat}`;
            }
            if (options.name) {
                form.name = options.name;
            }
            this.setData({
                form
            });
        }
    }
});