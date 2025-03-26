<template>
    <div class="com-container">
    <div class="com-chart" ref="hot_ref"></div>
    <span class="iconfont arr-left"   @click="toLeft"  :style="comStyle"
      >点我试试</span>
    <span class="iconfont arr-right"  @click="toRight" :style="comStyle"
      >点我试试</span>
    <span class="cat-name" :style="comStyle">{{ catName }}</span>
  </div>
  </template>
  <script>
import {getThemeValue} from '@/utils/theme_utils'
import { mapState } from 'vuex'
  export default {
    data() {
      return {
        chartInstance: null,
        allData: null,
        currentIndex: 0, // 当前所展示出的是一级分类数据
        titleFontSize: 0
    }
    },
    computed: {
      comStyle() {
      return {
        fontSize: this.titleFontSize + 'px',
        color:getThemeValue(this.theme).titleColor
      }
    },
      catName() {
      if (!this.allData) {
        return ''
      } else {
        return this.allData[this.currentIndex].name
      }
    },
    ...mapState(['theme'])
  },
  watch: {
    theme() {
      console.log('主题切换了')
      this.chartInstance.dispose() // 销毁当前的图表
      this.initChart() // 重新以最新的主题名称初始化图表对象
      this.screenAdapter() // 完成屏幕的适配
      this.updateChart() // 更新图表的展示
    }
  },
  created() {
    // 在组件创建完成之后 进行回调函数的注册
    this.$socket.registerCallBack('hotproductData', this.getData)
  },
    mounted() {
      this.initChart()
      // this.getData()
           // 发送数据给服务器, 告诉服务器, 我现在需要数据
  this.$socket.send({
      action: 'getData',
      socketType: 'hotproductData',
      chartName: 'hotproduct',
      value: ''
    })
      window.addEventListener('resize', this.screenAdapter)
      this.screenAdapter()
    },
    destroyed() {
      window.removeEventListener('resize', this.screenAdapter)
      // 在组件销毁的时候, 进行回调函数的取消
    this.$socket.unRegisterCallBack('hotproductData')
    },
    methods: {
      initChart() {
        this.chartInstance = this.$echarts.init(this.$refs.hot_ref, this.theme)
        const initOption = {
        title: {
          text: '▎ 热销商品的占比',
          left: 20,
          top: 20
        },
        legend: {
          top: '12%',
          icon: 'circle'
        },
        tooltip: {
          show: true,
          formatter: arg => {
            // console.log(arg)
            const thirdCategory = arg.data.children
            // 计算出所有三级分类的数值总和
            let total = 0
            thirdCategory.forEach(item => {
              total += item.value
            })
            let retStr = ''
            thirdCategory.forEach(item => {
              retStr += `
              ${item.name}:${parseInt((item.value / total) * 100) + '%'}
              <br/>
              `
            })
            return retStr
          }
        },
        series: [
          {
            type: 'pie',
            label: {
              show: false
            },
        emphasis: {
            label: {
                show: true
              },
        labelLine: {
                show: false
              }
            }
          }
        ]
        }
        this.chartInstance.setOption(initOption)
      },
       getData(ret){
      // 获取服务器的数据, 对this.allData进行赋值之后, 调用updateChart方法更新图表
      // const { data: ret } = await this.$http.get('hotproduct')
      this.allData = ret
    //   console.log(this.allData)
      this.updateChart()
      },
      updateChart (){
      //处理图表需要的数据
      const legendData = this.allData[this.currentIndex].children.map(item => {
        return item.name
      })
      const seriesData = this.allData[this.currentIndex].children.map(item => {
        return {
          name: item.name,
          value: item.value,
          children: item.children // 新增加children的原因是为了在tooltip中的formatter的回调函数中,来拿到这个二级分类下的三级分类数据
        }
      })
         const dataOption = {
        legend: {
          data: legendData
        },
        series: [
          {
            data: seriesData
          }
        ]
         }
         this.chartInstance.setOption(dataOption)
      },
      screenAdapter() {
        this.titleFontSize = (this.$refs.hot_ref.offsetWidth / 100) * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize
          }
        },
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize / 2,
          textStyle: {
            fontSize: this.titleFontSize / 2
          }
        },
        series: [
          {
            radius: this.titleFontSize * 4.5,
            center: ['50%', '60%']
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
      },
      toLeft() {
      this.currentIndex--
      if (this.currentIndex < 0) {
        this.currentIndex = this.allData.length - 1
      }
      this.updateChart()
    },
    toRight() {
      this.currentIndex++
      if (this.currentIndex > this.allData.length - 1) {
        this.currentIndex = 0
      }
      this.updateChart()
    }
    },

  }
  </script>
  
  <style lang="less" scoped>
.arr-left {
  position: absolute;
//   width: 65px;
//   height: 30px;
//   line-height: 30px;
//   background-color: gray;
  left: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: white;
}
.arr-right {
  position: absolute;
//   width: 65px;
//   height: 30px;
//   line-height: 30px;
//   background-color: gray;
  right: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: white;
}
.cat-name {
  position: absolute;
  color: azure;
  left: 80%;
  bottom: 20px;
}
</style>
  