<template>
    <div class="com-container">
    <div class="com-chart" ref="stock_ref"></div>
  </div>
  </template>
  
  <script>
  import { mapState } from 'vuex'
  export default {
    data() {
      return {
        chartInstance: null,
        allData: null,
        currentIndex: 0, // 当前显示的数据
        timerId: null // 定时器的标识
      }
    },
    created() {
    // 在组件创建完成之后 进行回调函数的注册
    this.$socket.registerCallBack('stockData', this.getData)
  },
    mounted() {
      this.initEcharts()
      // this.getData()
           // 发送数据给服务器, 告诉服务器, 我现在需要数据
  this.$socket.send({
      action: 'getData',
      socketType: 'stockData',
      chartName: 'stock',
      value: ''
    })
      window.addEventListener('resize', this.screenAdapter)
      this.screenAdapter()
    },
    destroyed() {
      window.removeEventListener('resize', this.screenAdapter)
      // 在组件销毁的时候, 进行回调函数的取消
    this.$socket.unRegisterCallBack('stockData')
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
       this.chartInstance = this.$echarts.init(this.$refs.stock_ref,this.theme)
       const initOption = {
        title: {
          text: '▎库存和销量分析',
          left: 20,
          top: 20
        }
       }
       this.chartInstance.setOption(initOption)
       this.chartInstance.on('mouseover', () => {
        clearInterval(this.timerId)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
      },
    // 获取服务器的数据, 对this.allData进行赋值之后, 调用updateChart方法更新图表
     getData(ret){
        // const { data: ret } = await this.$http.get('stock')
        this.allData = ret
        // console.log(this.allData)
        this.updateChart()
        this.startInterval()
      },
      updateChart() {
        const centerArr = [
        ['18%', '40%'],
        ['50%', '40%'],
        ['82%', '40%'],
        ['34%', '75%'],
        ['66%', '75%']
      ]
      const colorArr = [
        ['#4FF778', '#0BA82C'],
        ['#E5DD45', '#E8B11C'],
        ['#E8821C', '#E55445'],
        ['#5052EE', '#AB6EE5'],
        ['#23E5E5', '#2E72BF']
      ]
      // 处理图表需要的数据
      const start = this.currentIndex * 5
      const end = (this.currentIndex + 1) * 5
      const showData = this.allData.slice(start, end)
      const seriesArr = showData.map((item, index) => {
        return {
          type: 'pie',
          // radius:[110,100],
          hoverAnimation: false, // 关闭鼠标移入到饼图时的动画效果
          labelLine: {
            show: false // 隐藏指示线
          },
          label: {
            position: 'center',
            color: colorArr[index][0]
          },
          center: centerArr[index],
          data: [
            {
              name: item.name + '\n\n' + item.sales,
              value: item.sales,
              itemStyle: {
                color: new this.$echarts.graphic.LinearGradient(0, 1, 0, 0, [
                  {
                    offset: 0,
                    color: colorArr[index][0]
                  },
                  {
                    offset: 1,
                    color: colorArr[index][1]
                  }
                ])
              }
            },
            {
              value: item.stock,
              itemStyle: {
                color: '#333843'
              }
            }
          ]
        }
      })
      const dataOption = {
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption)
    },
      screenAdapter() {
        const titleFontSize = (this.$refs.stock_ref.offsetWidth / 100) * 3.6
        const innerRadius = titleFontSize * 2.8
        const outterRadius = innerRadius * 1.125
        const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        series: [
          {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
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
        this.currentIndex++
        if (this.currentIndex > 1) {
          this.currentIndex = 0
        }
        this.updateChart() // 在更改完currentIndex之后 , 需要更新界面
      }, 4000)
    }
    },
  }
  </script>
  
  <style lang="less" scoped></style>
  