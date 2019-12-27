<template>
  <div class="index">
    <h1 style="text-align: center">{{ msg }}</h1>

    <el-row :gutter="30">
      <el-col :span="12">
        <el-form ref="form" :model="form" label-width="120px">
          <el-form-item label="URL" prop="url">
            <el-input v-model="form.url" placeholder="仅支持https协议"></el-input>
          </el-form-item>
          <el-form-item label="Method" prop="method">
            <el-select v-model="form.method" placeholder="请选择">
              <el-option label="GET" value="GET"></el-option>
              <el-option label="POST" value="POST"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Headers" prop="headers">
            <el-input type="textarea" v-model="form.headers" placeholder="JSON格式"></el-input>
          </el-form-item>
          <el-form-item label="JSON Body" prop="body">
            <el-input type="textarea" v-model="form.body"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-s-promotion" @click="send">发送</el-button>
            <el-button icon="el-icon-refresh-right" @click="reset">清空</el-button>
            <el-button type="success" icon="el-icon-document-checked" @click="make">生成文档</el-button>
          </el-form-item>
        </el-form>

        <el-divider></el-divider>

        <div>
          <h5>请求参数</h5>
          <el-table :data="paramsData" border style="width: 100%">
            <el-table-column prop="name" label="参数名"></el-table-column>
            <el-table-column prop="required" label="必填">
              <template slot-scope="scope">
                <el-radio-group v-model="scope.row.required">
                  <el-radio :label="true" checked>是</el-radio>
                  <el-radio :label="false">否</el-radio>
                </el-radio-group>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型">
              <template slot-scope="scope">
                <el-select v-model="scope.row.type" placeholder="请选择">
                  <el-option v-for="(item, key) in types" :key="key" :label="item" :value="key"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="desc" label="说明">
              <template slot-scope="scope">
                <el-input v-model="scope.row.desc"></el-input>
              </template>
            </el-table-column>
          </el-table>

          <h5 class="mt-3">响应结果</h5>
          <el-table :data="respsData" border style="width: 100%">
            <el-table-column prop="name" label="参数名"></el-table-column>
            <el-table-column prop="type" label="类型">
              <template slot-scope="scope">
                <el-select v-model="scope.row.type" placeholder="请选择">
                  <el-option v-for="(item, key) in types" :key="key" :label="item" :value="key"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="desc" label="说明">
              <template slot-scope="scope">
                <el-input v-model="scope.row.desc"></el-input>
              </template>
            </el-table-column>
          </el-table>

          <el-button type="success" icon="el-icon-document-checked" class="mt-3" @click="make">生成文档</el-button>
        </div>
      </el-col>

      <el-col :span="12">
        <template v-if="docData">
          <el-button type="success" size="small" class="mb-2" @click="copy">复制下面内容到剪贴板</el-button>
          <div v-html="docData" class="markdown-body"></div>
        </template>
        <el-input
          v-else
          type="textarea"
          class="retTextarea"
          :autosize="{ minRows: 30, maxRows: 30}"
          readonly
          v-model="respsView"
        ></el-input>
      </el-col>
    </el-row>

    <pre ref="ret" class="d-none">
**请求URL：**
- ` {{form.url}} `

**请求方式：**
- {{form.method}}

**请求头：**

```
Content-Type:application/json
<template
  v-for="(item, index) in headersObj"
>{{index != 'X-TOKEN'?(index + ':' + item + '\n'):''}}</template>```

**请求参数：**

|参数名|必选|类型|说明|
|:----    |:---|:----- |-----   |
<template
  v-for="item in paramsData"
>{{'| ' + item.name + ' | ' + (item.required?'是':'否') + ' | ' + types[item.type] + ' | ' + item.desc + ' |\n'}}</template>

**响应结果：**

|字段名|类型|说明|
|:----    |:----- |-----   |
<template
  v-for="item in respsData"
>{{'| ' + item.name + ' | ' + types[item.type] + ' | ' + item.desc + ' |\n'}}</template>

**返回示例**

```
{{respsView}}

```
</pre>
    <!-- </el-dialog> -->
  </div>
</template>

<script>
import marked from 'marked'
import 'github-markdown-css'
export default {
  name: 'Index',
  props: {
    msg: String
  },
  data () {
    return {
      types: {
        null: '未知',
        number: '数字',
        integer: '整数',
        float: '浮点数',
        string: '字符串',
        array: '数组',
        object: '对象'
      },
      form: {
        url: '',
        method: '',
        headers: '',
        body: '',
        resp: {}
      },
      dialog: {
        visible: false
      },
      paramsData: [],
      respsData: [],
      docData: ''
    }
  },
  mounted () {
    this.form.url = './test.json'
    this.form.method = 'GET'
    this.form.headers = '{"token": "fake_token"}'
    this.form.body = '{"page":1, "limit":10}'
  },
  computed: {
    headersObj () {
      try {
        return JSON.parse(this.form.headers || '{}')
      } catch (e) {
        return {}
      }
    },
    paramsObj () {
      try {
        return JSON.parse(this.form.body || '{}')
      } catch (e) {
        return {}
      }
    },
    respsView () {
      return JSON.stringify(this.form.resp, null, 4)
    }
  },
  methods: {
    getStruct (data, prefix = '') {
      let retStruct = []

      let getType = function (value) {
        switch (value) {
          case 'array':
          case 'object':
            return value
          case null:
            return 'null'
          default:
            return typeof value
        }
      }

      let getRec = function (data, prefix) {
        if (data != null && typeof data === 'object') {
          if (Array.isArray(data) && data.length > 0) {
            data = data[0]
            if (prefix !== '') {
              retStruct.push({
                name: prefix,
                required: true,
                type: 'array',
                desc: ''
              })
            }
          } else {
            if (prefix !== '') {
              retStruct.push({
                name: prefix,
                required: true,
                type: 'object',
                desc: ''
              })
            }
          }

          if (typeof data === 'object') {
            for (let i in data) {
              getRec(data[i], (prefix !== '' ? prefix + '/' : '') + i)
            }
          }
        } else {
          retStruct.push({
            name: prefix,
            required: true,
            type: getType(data),
            desc: data
          })
        }
      }

      getRec(data, prefix)
      //   console.log(retStruct)

      return retStruct
    },
    parseParams () {
      this.paramsData = this.getStruct(this.paramsObj)
    },
    parseResps () {
      let obj = {}
      try {
        obj = this.form.resp.data || {}
      } catch (e) {}
      this.respsData = this.getStruct(obj)
    },
    genDoc () {
      console.log(this.$refs)
      // 处理markdown数据，data为markdown文件读出的字符串
      this.docData = marked(this.$refs.ret.innerHTML || '', {
        sanitize: true
      })
    },
    send () {
      this.docData = ''
      this.axios({
        method: this.form.method,
        url: this.form.url,
        headers: this.headersObj,
        data: this.paramsObj
      }).then(res => {
        console.log(res.data)
        this.form.resp = res.data

        this.parseParams()
        this.parseResps()
        // console.info(this.$_.chunk(['a', 'b', 'c', 'd'], 2))
      })
    },
    make () {
      this.genDoc()
      //   this.dialog.visible = true
    },
    copy () {
      this.$copyText(this.$refs.ret.innerHTML).then(
        e => {
          this.$message.success('复制成功')
          this.dialog.visible = false
          console.log(e)
        },
        function (e) {
          console.log(e)
        }
      )
    },
    reset () {
      this.$refs.form.resetFields()
      this.form.resp = {}
      this.paramsData = []
      this.respsData = []
      this.docData = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.table {
  /deep/ .el-button {
  }
}
h4 {
  //   margin-top: 0;
}
.retTextarea {
  /deep/ textarea {
  }
}
</style>
