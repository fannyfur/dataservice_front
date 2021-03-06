import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';
import { IonInfiniteScroll } from '@ionic/angular';
import { EnvService } from 'src/app/wongoing/env.service';
import { TouruchuanchuService } from '../touruchuanchu.service';

@Component({
  selector: 'app-input-output-result',
  templateUrl: './input-output-result.page.html',
  styleUrls: ['./input-output-result.page.scss'],
})
export class InputOutputResultPage implements OnInit {
  isShowHeader = this.env.IsShowHeader;
  infiniteScroll: IonInfiniteScroll;
  pageIndex = 1;    // 当前页的索引
  maxPageCount = 5; // 允许显示的最大页数
  pageSize = 15;     // 每页大小
  equipList: [];    // 保存选择的机台名称列表
  resultList: any;   // 保存结果数据的数组

  titleDate: any = '';
  titleDetail: any = '';

  /** 保存查询参数 */
  input: any = {
    startDate: '2016/03/15',
    endDate: '2016/03/30',
    equipCode: '',
    shiftId: '全部',
    shiftName: '全部',
    equipMultiple: '',
    pmtEquipList: []
  };

  constructor(private env: EnvService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private translate: TranslateService,
              private storage: Storage,
              private service: TouruchuanchuService) { }

  ngOnInit() {
    this.resultList = [];
    // 获取查询参数
    this.input = this.activatedRoute.snapshot.queryParams;
    this.initTitle();
    this.loadData();
  }

  /**
   * 初始化标题信息
   */
  public async initTitle() {
    this.titleDate = this.input.startDate + '~' + this.input.endDate;
    this.titleDetail = await this.translate.get('inputOutputResult_detail_title').toPromise();
    this.titleDetail = this.titleDetail.replace(/shiftName/g, this.input.shiftName);
  }

  /**
   * 下拉刷新事件处理
   * @param event 事件对象
   */
  public doDownRefresh(event) {
    console.log('Begin async operation');
    this.pageIndex = 1;     // 重新从第1页开始显示
    this.resultList.splice(0, this.resultList.length);    // 清空原缓存的数据
    this.loadData();
    setTimeout(() => {
      console.log('Async operation has eended');
      event.target.complete();
    }, 1000);
  }

  /**
   * 上拉加载下一页数据
   * @param event 事件对象
   */
  public doUpRefresh(event) {
    this.pageIndex++;   // 增加一页
    this.loadData();
    setTimeout(() => {
      console.log('Done');
      event.target.complete();

      if (this.pageIndex >= this.maxPageCount) {
        event.target.disabled = true;
      }
    }, 1000);
  }

  /**
   * 切换刷新控件的可用状态
   */
  public toggleInfiniteScroll() {
    this.infiniteScroll.disabled = !this.infiniteScroll.disabled;
  }

  /**
   * 数据加载
   */
  public async loadData() {
    let customerId = await this.storage.get('customerId');
    const offset: number = (this.pageIndex - 1) * this.pageSize;
    let res: any = await this.service.getBusConsumOutputResult(this.input.startDate, this.input.endDate, this.input.equipCode, this.input.shiftId, this.pageSize, offset);
    console.log(res);
    if (res && res.state && res.state == '0') {
      res.result.forEach(element => {
        this.resultList.push(element);
      });
    } else {
      console.warn('请求后台接口[getBusConsumOutputResult]异常!');
    }
  }

  /**
   * 跳转到图表展示页面
   * @param resultIndex 缓存数据的索引
   */
  public goChartPage(resultIndex: any) {
    console.log('resultIndex = ' + resultIndex);
    if (this.resultList && this.resultList.length > resultIndex) {
      const params = {
        startDate: this.input.startDate,
        endDate: this.input.endDate,
        equipCode: this.resultList[resultIndex][1],
        equipName: this.resultList[resultIndex][0],
        shiftId: this.input.shiftId,
        shiftName: this.input.shiftName
      };
      this.router.navigate(['/tabs/func/touruchanchu/inputoutputchart'], { queryParams: params });
    } else {
      console.warn('要查看的数据索引草果了缓存数据列表的长度!');
    }
  }
}
