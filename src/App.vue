<template>
  <div id="app" style="margin:0 auto;width:1000px;">
    <div style="width:100%;overflow:hidden;margin-bottom:20px;position:relative;">
      <img src="./assets/a.jpg" style="width:100%;display:block;">
      <div id="titlebar">
        <div id="title">华三洗消监控系统</div>
      </div>
    </div>
	<div>
	    <el-form :inline="true" label-width="60px" @submit.native.prevent>
            <el-form-item label="日期">
                <el-date-picker
                        v-model="fromdate"
                        value-format="yyyy-MM-dd"
                        :editable="false"
                        style="width: 135px">
                </el-date-picker>
            </el-form-item>
            <el-form-item label="至" label-width="22px">
                <el-date-picker
                        v-model="todate"
                        value-format="yyyy-MM-dd"
                        :editable="false"
                        style="width: 135px">
                </el-date-picker>
            </el-form-item>
            <el-form-item label="状态">
                <el-select v-model="CYCLE" style="width:90px">
                    <el-option label="全部" value=""></el-option>
                    <el-option label="通过" value="PASS"></el-option>
                    <el-option label="失败" value="FAIL"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="机器">
                <el-select v-model="machine" multiple collapse-tags placeholder="全部" style="width:210px">
                    <el-option v-for="item in machines" :key="item" :value="item"></el-option>
                </el-select>
            </el-form-item>
			<el-button type="primary" style="margin-left:20px" @click="query">查询</el-button>
			<el-button type="primary" style="margin-left:8px" @click="print" :disabled="tableData.length===0">打印</el-button>
		</el-form>
	</div>
    <div class="infoframe">
        <div class="infohead">
            <div style="margin-left:32px">
                洗消日志
            </div>
        </div>
		<div>
			<el-table id="mydatatable" :data="tableData"
				row-key="id"
				:row-class-name="tableRowClassName"
				@row-dblclick="rowdbclick"
				>
                    <el-table-column
                            v-for="col in cols" :key="col.label"
                            :prop="col.prop" :label="col.label" :width="col.width" show-overflow-tooltip>
                    </el-table-column>
			</el-table>
		</div>
    </div>
	<el-dialog :visible.sync="dialogTableVisible" width="50%" title="洗消循环明细">
		<div id="stepstable">
			<el-table :data="details" :show-header="false">
				<el-table-column prop="0"/>
				<el-table-column prop="1"/>
			</el-table>
			<el-table :data="steps.filter(v=>!stepfilters[stepfilter].includes(parseInt(v.step)))">
				<el-table-column prop="time" label="时间" :width="100"/>
				<el-table-column prop="step" label="步骤" :width="100"/>
				<el-table-column prop="info" label="信息" :formatter="formatter"/>
			</el-table>
		</div>
		<div style="text-align:center;padding-top:16px;padding-bottom:20px;">
			<el-select v-model="stepfilter" style="width:160px;margin-right:20px;">
				<el-option key="0" label="原始过程记录" :value="0"/>
				<el-option key="1" label="无酶清洗程序" :value="1"/>
				<el-option key="2" label="有酶清洗程序" :value="2"/>
			</el-select>
			<el-button type="primary" @click="printsteps">打印</el-button>
		</div>
	</el-dialog>
  </div>
</template>

<script>
    import {restbase,reserr} from './restapi.js';
	import {trans} from './trans'
	
    function getStringLen(str) {
        if (typeof str !== 'string') return 0;
        let l = str.length;
        let blen = 0;
        for(let i=0; i<l; i++) {
            if ((str.charCodeAt(i) & 0xff00) !== 0) {
                blen ++;
            }
            blen ++;
        }
        return blen;
    }	
	
export default {
	name: 'app',
	data() {
		return {
			fieldNames: {},
			machines: [],
			fromdate: '',
			todate: '',
			CYCLE: '',
			machine: [],
			tableData: [],
			cols:[],
			dialogTableVisible: false,
			details: [],
			steps: [],
			stepfilters: [[6],[3,4,5,6,7,8,11,12],[4,6,7,8,11,12]],
			stepfilter: 0
		}
	},
	mounted() {
		this.$axios.get(restbase() + 'fieldnames')
			.then(response => {
				this.fieldNames = response.data;
			})
			.catch(error => {
				if (error) {
					console.dir(error);
					this.$message.error(reserr(error));
				}
			});
		this.$axios.get(restbase() + 'machines')
			.then(response => {
				this.machines = response.data;
			})
			.catch(error => {
				if (error) {
					console.dir(error);
					this.$message.error(reserr(error));
				}
			});
	},
	methods:{
		query() {
			this.$axios.get(restbase() + 'query',{params:{
					fromdate: this.fromdate,
					todate: this.todate,
					CYCLE: this.CYCLE,
					machine: this.machine
				}})
				.then(response => {
					const d = response.data;
					this.showtable(d);
				})
				.catch(error => {
					if (error) {
						this.$message.error(reserr(error));
					}
				});
		},
		showtable(d) {
			if (d.length > 0) {
				this.cols = [];
				for(let k in d[0]) {
					if (k === "Steps") continue;
					let a = d[0][k];
					let len = a ? getStringLen(a.toString()) : 10;
					if (len < 10) len = 10;
					if (len > 20) len = 20;
					this.cols.push({prop:k, label:this.fieldNames[k]||k, width: len * 9 + 16});
				}
				this.tableData = d;
			} else {
				this.tableData = [];
			}
		},
		tableRowClassName({row, rowIndex}) {
			if (row["CYCLE"] === "FAIL") {
			  return 'fail-row';
			}
			return '';
		},
		rowdbclick(row, column, event) {
			this.dialogTableVisible = true;
			let r = Object.assign({}, row);
			delete r.Steps;
			const s = Object.entries(r);
			this.details = s.map(a => [this.fieldNames[a[0]]||a[0], a[1]]);
			this.steps = JSON.parse(row.Steps);
		},
		formatter(row, column) {
			for (let n in trans) {
				if (row.info.includes(n)) {
					return row.info.replace(n, trans[n]);
				}
			}
			return row.info;
		},
		print() {
			var printHtml = document.getElementById("mydatatable").innerHTML;
			let wind = window.open("",'newwindow', 'height=300, width=700, top=100, left=100, toolbar=no, menubar=no, scrollbars=no, resizable=no,location=n o, status=no');
			wind.document.body.innerHTML = printHtml;
			wind.print();
		},
		printsteps() {
			let printHtml = document.getElementById("stepstable").innerHTML;
			let wind = window.open("",'newwindow', 'height=300, width=700, top=100, left=100, toolbar=no, menubar=no, scrollbars=no, resizable=no,location=n o, status=no');
			wind.document.body.innerHTML = printHtml;
			wind.print();
		}
	}
}
</script>

<style>
@media print {
  body {
    font-size: 6px;
  }
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 20px;
}
#titlebar {
  position: absolute;
  height: 40px;
  top: 120px;
  left: 120px;
}
#title {
  position: relative;
  color: white;
  text-shadow: 1.5px 1.5px 1px #555;
  font-size:2em;
}
    .infoframe {
        position: relative;
        width:1000px;
        margin:0 auto;
        border-radius: 4px;
        border-left: 1px solid #ddd;
        box-shadow: 3px 3px 3px #aaa;
        background-color: white;
    }
    .infohead {
        width:100%;
        height:48px;
        line-height:48px;
        padding:0;
        color:white;
        background-color:#80A0D0;
        border-radius:4px 4px 0 0;
    }
    .infoform {
        padding: 30px 170px 10px 130px;
    }
  .el-table .fail-row {
    background: #FFCFCF;
  }
  div.el-dialog__body {
	padding: 0 20px;
  }
</style>
