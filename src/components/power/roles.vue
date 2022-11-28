<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片试图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRolesVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot={row}>
            <el-row :class="['bdBottom','vcenter',i1 === 0 ? 'bdTop':'']" v-for="(item1 , i1) in row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5" >
                <el-tag closable @close="removeRightById(row,item.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row :class="['vcenter',i2 === 0 ? '' : 'bdTop']" v-for="(item2 , i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(row,item2.id)">
                      {{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="(item3 , i3) in item2.children" :key="item3.id" closable @close="removeRightById(row,item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="角色操作" width="300px">
          <template v-slot={row}>
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editRoles(row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRoles(row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色的对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRolesVisible" width="50%" @close="addRolesClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addRolesForm" :rules="addRolesRules" ref="addRolesRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色的对话框 -->
    <el-dialog title="修改角色" :visible.sync="editRolesVisible" width="50%" @close="editRolesVisible = false">
      <!-- 内容主体区域 -->
      <el-form :model="editForm"  ref="editRolesRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRolesVisible = false">取 消</el-button>
        <el-button type="primary" @click="edit">确 定</el-button>
      </span>
    </el-dialog>


    <!-- 分配权限的对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRightDialogVisible" width="50%" >
      <!-- 内容主体区域 -->
      <el-tree :data="rightsList" node-key="id" :props="treeProps" show-checkbox default-expand-all	:default-checked-keys="defKeys" ref="treeRef"> </el-tree>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>


  
</template>

<script>
export default {
  data(){
    return {
      //当前即将分配角色权限的id
      roleId:'',
      //添加角色对话框是否展示
      addRolesVisible:false,
      //修改角色对话框是否展示
      editRolesVisible:false,
      setRightDialogVisible:false,
      //所有角色列表数据
      roleList:[],
      //添加角色的对象
      addRolesForm:{
        roleName:'',
        roleDesc:''
      },
      addRolesRules:{
        roleName:[
        { required: true, message: "请输入角色名", trigger: 'blur' }
        ],
        roleDesc:[
        { required: true, message: "请输入角色描述", trigger: 'blur' }
        ],
      },
      //修改角色的对象
      editForm:{
      },
      //所有权限的数据
      rightsList:[],
      //树形控件的绑定对象
      treeProps: {
          children: 'children',
          label: 'authName'
      },
      defKeys:[]
    }
  },
  created(){
    this.getRolesList()
  },
  methods:{
    async getRolesList(){
      const {data:res} = await this.$http.get('roles')
      if(res.meta.status!=200) return this.$message.error("获取错误")

      this.roleList = res.data
      
    },
    addRoles(){
      this.$refs.addRolesRef.validate( async valid=>{
        if(!valid) return;
        //如果验证成功
        const {data:res} = await this.$http.post('roles',this.addRolesForm)
        if(res.meta.status!=201) return this.$message.error("添加失败！")
        this.$message.success("添加成功")
        //更新数据
        this.getRolesList()
        //关闭对话框
        this.addRolesVisible = false
      })
    },
    //关闭角色添加窗口
    addRolesClosed(){
      this.$refs.addRolesRef.resetFields()
    },
    //跟据id查询角色
    async editRoles(id){
      this.editRolesVisible = true
      const {data:res } = await this.$http.get('roles/'+id) 
      if(res.meta.status!=200) return this.$message.error("获取失败")
      this.editForm = res.data
      
    },
    async edit(){
      
      const {data:res} = await this.$http.put('roles/'+this.editForm.roleId,{roleName:this.editForm.roleName,
      roleDesc:this.editForm.roleDesc})
      if(res.meta.status!=200) return this.$message.error("编辑失败")
      this.$message.success("编辑成功")
      this.getRolesList()
      this.editRolesVisible = false
    },
    async deleteRoles(id){
      const confirmresult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err);
      //用户取消删除
      if(confirmresult !="confirm"){
        return this.$message.info('已经取消删除')
      }
      const {data:res} = await  this.$http.delete('roles/'+ id)
      if(res.meta.status!=200) return this.$message.error("删除失败")
      this.$message.success("删除成功")
      this.getRolesList()
    },
    //跟据id删除对应的权限
    async removeRightById(row,rightId){
      //弹窗显示用户是否要删除
      const confirmresult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          center: true
        }).catch(err =>err)
        if(confirmresult!=='confirm'){
          return this.$message.info('取消了删除')
        }
        const {data:res} = await this.$http.delete(`roles/${row.id}/rights/${rightId}`)
        if(res.meta.status!=200){
          return this.$message.error('删除权限失败')
        }

        //将服务器返回的最新的数据直接赋值给row 从而不会导致页面刷新而影响用户体验
        row.children = res.data
        
      },
      //展示分配权限的对话框
      async showSetRightDialog(row){
        this.roleId = row.id
        const{data:res} = await this.$http.get('rights/tree')
        if(res.meta.status!=200){
          this.$message.error('获取权限失败')
        }
        //获取到的权限数据保存到data中
        this.rightsList = res.data
        
        //递归获取三级节点的id
        this.defKeys = []
        this.getLeafKeys(row,this.defKeys)
        this.setRightDialogVisible = true
      },//通过递归的形式，获取角色下所有三级权限的id，并保存到defkeys当中
      getLeafKeys(node,arr){
        //如果当前node节点不包含children属性 则是三级节点
        if(!node.children){
          return arr.push(node.id)
        }

        node.children.forEach(item => this.getLeafKeys(item,arr))
      },
      //点击为角色分配权限
      async allotRights(){
        const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ]

        const idStr = keys.join(',')
        console.log(idStr);
        const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
        if(res.meta.status!=200){
          return this.$message.error("分配失败")

        }
        this.$message.success("成功")
        this.getRolesList()
        this.setRightDialogVisible = false
      }
  }
}
</script>

<style lang="less" scoped>
.el-tag{
  margin: 7px;
}

.bdTop{
  border-top: 1px solid #eee;
}

.bdBottom{
  border-bottom: 1px solid #eee;
}

.vcenter{
  display: flex;
  align-items: center;
}
</style>