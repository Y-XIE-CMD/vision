<template>
    <div class="com-container">
      <div class="com-chart" ref="rank_ref"></div> 
    </div>
  </template>
  
  <script>
  import { mapState } from 'vuex'
  export default {
    data() {
      return {
        chartInstance: null,
        allData: null,
        startValue: 0, // 区域缩放的起点值
        endValue: 9, // 区域缩放的终点值
        timerId: null // 定时器的标识
       }
    },
    created() {
    // 在组件创建完成之后 进行回调函数的注册
    this.$socket.registerCallBack('rankData', this.getData)
  },
    mounted() {
      this.initEcharts()
      // this.getData()
           // 发送数据给服务器, 告诉服务器, 我现在需要数据
  this.$socket.send({
      action: 'getData',
      socketType: 'rankData',
      chartName: 'rank',
      value: ''
    })
      window.addEventListener('resize', this.screenAdapter)
      this.screenAdapter()
    },
    destroyed() {
      window.removeEventListener('resize', this.screenAdapter)
          // 在组件销毁的时候, 进行回调函数的取消
    this.$socket.unRegisterCallBack('rankData')
      // 在组件销毁的时候, 进行回调函数的取消
      clearInterval(this.timerId)
    },
  computed: {
    ...mapState(['theme'])
  },
  watch: {
    theme() {
      console.log('主题切换了')
      //销毁当前的图表
      this.chartInstance.dispose() 
      //重新以最新的主题名称初始化图表对象
      this.initEcharts()
      //完成屏幕的适配
      this.screenAdapter()
      //更新图表的展示
      this.updateChart()
    }
  },
    methods: {
      initEcharts() {
        this.chartInstance = this.$echarts.init(this.$refs.rank_ref,this.theme)
        const initOption = {
        title: {
          text: '▎ 地区销售排行',
          left: 20,
          top: 20
        },
        grid: {
          top: '40%',
          left: '5%',
          right: '5%',
          bottom: '5%',
          containLabel: true  //包含坐标轴上的文字
        },
        tooltip: {
          show: true
        },
        xAxis: {
          type: 'category'
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            type: 'bar'
          }
        ]
        }
        this.chartInstance.setOption(initOption)
        this.chartInstance.on('mouseover', () => {
        clearInterval(this.timerId)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
      },
     getData(ret){
        // const { data: ret } = await this.$http.get('rank')
        this.allData = ret
        // 对allData里面的每一个元素进行排序
        this.allData.sort((a, b) => {
        return b.value - a.value
      })
        // console.log(this.allData)
        this.updateChart()
        this.startInterval()
      },
      updateChart (){
        const colorArr = [
        ['#0BA82C', '#4FF778'],
        ['#2E72BF', '#23E5E5'],
        ['#5052EE', '#AB6EE5']
      ]
         // 处理图表需要的数据
      // 所有省份所形成的数组
      const provinceArr = this.allData.map(item => {
        return item.name
      })
       // 所有省份对应的销售金额
      const valueArr = this.allData.map(item => {
        return item.value
      })
         const dataOption = {
        xAxis: {
            data: provinceArr
        },
        dataZoom: {
          show: false,
          startValue: this.startValue,
          endValue: this.endValue
        },
        series: [
          {
            data: valueArr,
            itemStyle: {
              color: arg => {
                let targetColorArr = null
                if (arg.value > 300) {
                  targetColorArr = colorArr[0]
                } else if (arg.value > 200) {
                  targetColorArr = colorArr[1]
                } else {
                  targetColorArr = colorArr[2]
                }
                return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: targetColorArr[0]
                  },
                  {
                    offset: 1,
                    color: targetColorArr[1]
                  }
                ])
              }
            }
          }
        ]
         }
         this.chartInstance.setOption(dataOption)
      },
      screenAdapter() {
      const titleFontSize = (this.$refs.rank_ref.offsetWidth / 100) * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {
              barBorderRadius: [titleFontSize / 2, titleFontSize / 2, 0, 0]
            }
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
      },
      startInterval() {
      if (this.timerId) {
        clearInterval(this.timerId)
      }
      this.timerId = setInterval(() => {
        this.startValue++
        this.endValue++
        if (this.endValue > this.allData.length - 1) {
          this.startValue = 0
          this.endValue = 9
        }
        this.updateChart()
      }, 2000)
    }
    },
  }
  </script>
  
  <style lang="less" scoped></style>
  