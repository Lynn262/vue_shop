<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片试图区域 -->
    <el-card>
      <!-- 头部的警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置参数" type="warning" :closable="false" show-icon>
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader v-model="selectedCateKeys" :options="cateList" :props="cateProps" @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>

      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数
          </el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData">
            <el-table-column type="expand">
              <template v-slot="{ row }">
                <!-- 循环渲染tag标签 -->
                <el-tag v-for="(item, i) in row.attr_vals" :key="i" closable @close="handleClose(i,row)">
                  {{ item }}
                </el-tag>
                <!-- 输入文本框 -->
                <el-input class="input-new-tag" v-if="row.inputVisible" v-model="row.inputValue" ref="saveTagInput"
                  size="small" @blur="handleInputConfirm(row)">
                </el-input>
                <!-- 添加的按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(row)">+ New Tag</el-button>

              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="{ row }">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(row.attr_id)">编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加静态属性
          </el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData">
            <el-table-column type="expand">
              <template v-slot="{ row }">
                <!-- 循环渲染tag标签 -->
                <el-tag v-for="(item, i) in row.attr_vals" :key="i" closable @close="handleClose(i,row)">
                  {{ item }}
                </el-tag>
                <!-- 输入文本框 -->
                <el-input class="input-new-tag" v-if="row.inputVisible" v-model="row.inputValue" ref="saveTagInput"
                  size="small" @blur="handleInputConfirm(row)">
                </el-input>
                <!-- 添加的按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(row)">+ New Tag</el-button>

              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="{ row }">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(row.attr_id)">编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 添加参数的对话框 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 修改参数的对话框 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateList: [],
      //级联选择框的配置对象
      cateProps: {
        value: "cat_id",
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      //级联选择框 双向绑定的数组
      selectedCateKeys: [],
      //被激活的页签的名称
      activeName: 'many',
      //动态参数的数据
      manyTableData: [],
      //静态属性的数据
      onlyTableData: [],
      //控制添加对话框的显示与隐藏
      addDialogVisible: false,
      //修改表单对话框的显示与隐藏
      editDialogVisible: false,

      //添加表单的对象
      addForm: {
        attr_name: ''
      },
      //修改表单的对象
      editForm: {
        attr_name: ''
      },
      //添加表单的规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数', trigger: 'blur' }
        ]
      },
      //修改表单的规则
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    //获取所有商品分类列表
    this.getCateList()

  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status != 200) {
        return this.$message.error("获取商品分类失败")
      }
      this.cateList = res.data
      console.log(this.cateList);
    },
    handleChange() {
      this.getParamsData()
    },
    //tab页签点击事件的处理
    handleTabClick() {
      console.log(this.activeName);
      this.getParamsData()
    },
    //获取参数的列表数据
    async getParamsData() {
      //选中的不是三级分类
      if (this.selectedCateKeys.length != 3) {
        this.selectedCateKeys = []
        return
      }

      console.log(this.selectedCateKeys);
      //跟据所选分类的id和当前所处的面板 获取对应的参数
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes
`, { params: { sel: this.activeName } })

      if (res.meta.status != 200) {
        return this.$message.error("获取参数列表失败")
      }

      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        //控制文本框的显示与隐藏
        item.inputVisible = false
        //文本框中输入的值
        item.inputVisible = ''
      })

      console.log(res.data);
      if (this.activeName == 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }


    },
    //监听添加对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    //监听修改对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    //点击按钮添加参数
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName

        })
        if (res.meta.status != 201) {
          return this.$message.error("失败")
        }
        this.$message.success("成功")
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    //展示修改参数
    async showEditDialog(id) {
      //这是查询当前参数的信息
      console.log(id, this.cateId);
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, {
        params: { attr_sel: this.activeName }
      })
      if (res.meta.status != 200) return this.$message.error("失败")
      this.editForm = res.data
      this.editDialogVisible = true
    },
    //点击按钮修改参数
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name, attr_sel: this.activeName
        })
        console.log(res);
        if (res.meta.status != 200) return this.$message.error("修改失败")
        this.$message.success("成功")
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    //跟据id删除对应的参数项
    async removeParams(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该属性, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult != 'confirm') return
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
      if (res.meta.status != 200) return this.$message.error('删除失败')
      this.$message.success("成功")
      this.getParamsData()
    },
    //文本框失去焦点或摁下enter建都会触发
    async handleInputConfirm(row) {
      console.log(row);
      if(row.inputValue.trim().length == 0){
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      //如果没有return说明用户输入了东西需要做后续处理
      
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
     
      this.saveAttr(row)
    },
    //点击按钮展示文本输入框
    showInput(row) {
      row.inputVisible = true
      //让文本框自动获得焦点
      //nexttick方法的作用就是当页面上元素被重新渲染之后才会执行回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    //删除对应的参数和选项
    handleClose(i,row){
      row.attr_vals.splice(i,1)
      this.saveAttr(row)

    },
    async saveAttr(row){
       //需要发起请求保存这次操作
       const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
        attr_name:row.attr_name,
        attr_sel:row.attr_sel,
        attr_vals:row.attr_vals.join(' ')
      })

      if(res.meta.status!=200){return this.$message.error('失败')}
      this.$message.success("成功")
    }
  },
  computed: {
    //如果按钮需要被禁用 则返回true 否则返回false
    isBtnDisabled() {
      if (this.selectedCateKeys.length == 3) {
        return false
      }
      return true

    },
    //当前选中的三级分类的id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    //动态计算标题的文本
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}

.el-tag {
  margin: 10px
}

.input-new-tag {
  width: 120px;
}
</style>