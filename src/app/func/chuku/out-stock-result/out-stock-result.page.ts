import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage';
import { IonInfiniteScroll } from '@ionic/angular';
import { EnvService } from 'src/app/wongoing/env.service';
import { OutStockService } from '../out-stock.service';

@Component({
  selector: 'app-out-stock-result',
  templateUrl: './out-stock-result.page.html',
  styleUrls: ['./out-stock-result.page.scss'],
})
export class OutStockResultPage implements OnInit {
  isShowHeader = this.env.IsShowHeader;
  infiniteScroll: IonInfiniteScroll;
  pageIndex = 1;    // 当前页的索引
  maxPageCount = 5; // 允许显示的最大页数
  pageSize = 5;     // 每页大小
  resultList: any;   // 保存结果数据的数组

  /** 保存查询参数 */
  startDate: any = '2016/03/15';
  endDate: any = '2018/03/30';
  materCode: any = '';
  constructor(private env: EnvService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private storage: Storage,
              private service: OutStockService) { }

  ngOnInit() {
    this.resultList = [];
    this.loadData();
  }

  /**
   * 下拉刷新事件处理
   * @param event 事件
   */
  public doDownRefresh(event) {
    console.log('Begin async operation');
    this.pageIndex = 1;   // 重新从第1页开始显示
    this.resultList.splice(0, this.resultList.length);   // 清空原缓存的数据
    this.loadData();
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 1000);
  }

  /**
   * 上拉刷新加载分页数据
   * @param event 事件
   */
  public doUpRefresh(event) {
    this.pageIndex++; // 增加一页
    this.loadData();
    setTimeout(() => {
      console.log('Done');
      event.target.complete();

      // // App logic to determine if all data is loaded
      // // and disable the infinite scroll
      if (this.pageIndex >= this.maxPageCount) {
        event.target.disabled = true;
      }
    }, 1000);
  }

  toggleInfiniteScroll() {
    this.infiniteScroll.disabled = !this.infiniteScroll.disabled;
  }

  /**
   * 数据加载
   */
  public loadData() {
    // 从Storage获取customerId
    this.storage.get('customerId').then((customerId) => {
      // console.log('----------------------------------------');
      // console.log('customerId = ' + customerId);
      // 获取路由参数
      this.activatedRoute.queryParams.subscribe(param => {
        this.startDate = param['startDate'];
        this.endDate = param['endDate'];
        const offset: number = (this.pageIndex - 1) * this.pageSize;
        this.service.getBusOutStockResult(
                                            param['startDate'],
                                            param['endDate'],
                                            offset,
                                            this.pageSize).then((res: any) => {
          if (res && res.state && res.state === '0') {
            console.log(res);
            //debugger;
            // 把结果数据压入结果数组列表中。
            res.result.forEach((element: never) => {
              this.resultList.push(element);
            });
          } else {
            console.warn('请求后台接口[getBusOutStockResult]异常!');
          }
        }).catch(err => {
          console.error(err);
        });
      });
    }).catch(error => {
      console.error('从Storage中获取customerId失败!', error);
    });
  }

  /**
   * 跳转到图表展示页面
   */
  public goChartPage(resultIndex: any) {
    console.log('resultIndex = ' + resultIndex);
    if (this.resultList && this.resultList.length > resultIndex)
    {
      //获取物料编码
      this.materCode = this.resultList[resultIndex][1];

      const params = { 
        dsType: 'demoDs', 
        startDate: this.startDate, 
        endDate: this.endDate, 
        materCode :this.materCode,
        offset :(this.pageIndex - 1) * this.pageSize,
        limit : this.pageSize,
        materName :this.resultList[resultIndex][0],
        weight :this.resultList[resultIndex][2],
        convertStdNum :this.resultList[resultIndex][3]
      }
      this.router.navigate(['/tabs/func/chuku/outStockChart'], { queryParams: params });
    } else {
      console.warn('要查看的数据索引超过了缓存数据列表的长度!');
    }
  }

}
