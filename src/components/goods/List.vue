<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片试图 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容"  v-model="queryInfo.query" clearable @clear="getGoodList()">
            <el-button slot="append" icon="el-icon-search" @click="getGoodList()"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4" >
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>

      <el-table :data="goodslist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="商品创建时间" prop="add_time" width="140px">
          <template v-slot="{row}">
            {{row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template v-slot="{row}">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="remove(row)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total" background>
    </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //查询参数对象
      queryInfo:{
        query:'',
        pagenum:1,
        pagesize:10
      },
      //商品列表
      goodslist:[],
      //总数据条数
      total:0,
    }
  },
  created() {
    this.getGoodList()
  },
  methods: {
    //根据分页获取对应的商品列表
    async getGoodList(){
      const {data:res} = await this.$http.get('goods',{params:this.queryInfo})
      if(res.meta.status!=200)return this.$message.error("失败")
      console.log(res.data);
      this.goodslist = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange(newsize){
      this.queryInfo.pagesize = newsize
      this.getGoodList()
    },
    handleCurrentChange(newpage){
      this.queryInfo.pagenum = newpage
      this.getGoodList()
    },
    //删除商品的函数
    async remove(row){
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)

      if(confirmResult!='confirm')return 
      const {data:res} = await this.$http.delete('goods/'+ row.goods_id)
      if(res.meta.status!=200) return this.$message.error('删除失败')
      this.$message.success("删除成功")
      this.getGoodList()
    },
    goAddpage(){
      this.$router.push('/goods/add')
    }

  }
}
</script>

<style lang="less" scoped>

</style>