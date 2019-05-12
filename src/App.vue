<template>
  <div id="app" style="margin:0 auto;width:1000px;">
    <div style="width:100%;overflow:hidden;margin-bottom:20px;position:relative;">
      <img src="./assets/a.jpg" style="width:100%;display:block;">
      <div id="titlebar">
        <div id="title">华三洗消监控系统</div>
      </div>
    </div>
	<div>
	    <el-form :inline="true" label-width="80px" @submit.native.prevent>
            <el-form-item label="时间段起">
                <el-date-picker
                        v-model="fromdate"
                        value-format="yyyy-MM-dd"
                        :editable="false"
                        style="width: 140px">
                </el-date-picker>
            </el-form-item>
            <el-form-item label="至" label-width="22px">
                <el-date-picker
                        v-model="todate"
                        value-format="yyyy-MM-dd"
                        :editable="false"
                        style="width: 140px">
                </el-date-picker>
            </el-form-item>
            <el-form-item label="状态">
                <el-select v-model="CYCLE" style="width:110px">
                    <el-option label="全部" value=""></el-option>
                    <el-option label="通过" value="PASS"></el-option>
                    <el-option label="失败" value="FAIL"></el-option>
                </el-select>
            </el-form-item>
			<el-button type="primary" style="margin-left:40px" @click="query">查询</el-button>
		</el-form>
	</div>
    <div class="infoframe">
        <div class="infohead">
            <div style="margin-left:32px">
                洗消日志
            </div>
        </div>
		<div>
			<el-table :data="tableData" stripe>
                    <el-table-column
                            v-for="col in cols" :key="col.label"
                            :prop="col.prop" :label="col.label" :width="col.width">
                    </el-table-column>
			</el-table>
		</div>
    </div>
  </div>
</template>

<script>
    import {restbase,reserr} from './restapi.js';

export default {
	name: 'app',
	data() {
		return {
			fromdate: '',
			todate: '',
			CYCLE: '',
			tableData: [],
			cols:[]
		}
	},
	methods:{
		query() {
			this.$axios.get(restbase() + 'query',{params:{
					fromdate: this.fromdate,
					todate: this.todate,
					CYCLE: this.CYCLE
				}})
				.then(response => {
					const d = response.data.data;
					this.showtable(d);
				})
				.catch(error => {
					if (error) {
//						console.dir(error);
						this.$message.error(reserr(error));
					}
				});
		},
		showtable(d) {
			if (d.length > 0) {
				this.cols = [];
				for(let k in d[0]) {
					let a = d[0][k];
					let len = a ? getStringLen(a.toString()) : 8;
					if (len < 8) len = 8;
					this.cols.push({prop:k, label:k, width: len * 9 + 16});
				}
				this.tableData = d;
			} else {
				this.tableData = [];
			}
		}
	}
}
</script>

<style>
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
        height: 470px;
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
</style>
