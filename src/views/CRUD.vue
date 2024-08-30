<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { genFileId } from 'element-plus';
import ExcelJS from "exceljs";
import FileSaver from "file-saver";

import {
    authorize, getDishesByCanteen, getNewDishes, getDishById, getCarousel, postUploadExcel, postAddDish, postCarousel, postNewDish, putEditDish, deleteDishById, deleteNewDish
} from '@/api/http'

onMounted(() => {
    authorize();
    getRawData(1);
    getNewDishesData(1);
    getNewDishesData(2);
});

var file = null;
var refresh = 0;
var record = 1;

const excelHeaderDict = {
    "id": '编号',
    "canteen": '餐厅',
    "floor": '楼层',
    "window": '窗口',
    "name": '菜品',
    "measure": '衡量',
    "price": '价格',
    "average_vote": '评分',
    "image": '图片'
};
const excelHeaderDictT = {
    "编号": 'id',
    "餐厅": 'canteen',
    "楼层": 'floor',
    "窗口": 'window',
    "菜品": 'name',
    "衡量": 'measure',
    "价格": 'price',
    "评分": 'average_vote',
    "图片": 'image'
};
const canteenDict = ['', '欣园', '悦园'];
const floorDict = ['', '一楼', '二楼', '三楼', '四楼'];

const rawData = ref([]);
// const newDishesData = ref([[], [], []]);
const newDishesData = ref([[], [], []]);

const search = ref('');
const imageSrc = ref('https//:www.114514.com')

const filterRawData = computed(() =>
    rawData.value.filter(
        (data) =>
            !search.value ||
            data.name.toLowerCase().includes(search.value.toLowerCase())
    )
);

const totalPages = computed(() => Math.ceil(filterRawData.value.length / 10));
const currentPage = ref(1);
const pageData = computed(() => filterRawData.value.slice(10 * (currentPage.value - 1), 10 * currentPage.value));

const mainContentVisible = ref([true, false, false]);
const editFormVisible = ref(false);
const addFormVisible = ref(false);
const editFormValidate = ref({
    "window": true,
    "price": true,
});
const addFormValidate = ref({
    "canteen": false,
    "floor": false,
    "window": false,
    "name": false,
    "measure": false,
    "price": false,
});
const editAble = computed(() => editFormValidate.value.window && editFormValidate.value.price);
const addAble = ref(false);
const formLabelWidth = '80px';

const csDisplay = ref({});
const csChangedData = ref({
    "canteen": null,
    "floor": null,
    "window": null,
    "name": '',
    "measure": '',
    "price": null,
});
const csAddData = ref({
    "canteen": null,
    "floor": null,
    "window": null,
    "name": '',
    "measure": '',
    "price": null,
});
const addDish = ref(null);

const handleMenuChange = (index) => {
    mainContentVisible.value[record - 1] = false;
    mainContentVisible.value[index - 1] = true;
    record = index;
}

const getRawData = async (canteen) => {
    rawData.value = await getDishesByCanteen(canteen || refresh);
    refresh = canteen || refresh;
}
// 这边得到的是数组，所以用了里面的值
const getCarouselData = async (canteen) => imageSrc.value = await getCarousel(canteen)[0];
const getNewDishesData = async (canteen) => newDishesData.value[canteen] = await getNewDishes(canteen);

const handleAdd = () => {
    addFormVisible.value = true;
}
const handleEdit = (dish) => {
    csDisplay.value = dish;
    editFormVisible.value = true;
}
const handleDelete = (id, name) => {
    if (confirm(`请确认是否删除 ${id} 号菜品 ${name} `)) {
        deleteDishById(id).then((res) => {
            getRawData(0);
        }).catch((error) => {
            console.log(error);
        })
    }
}
const handleNewDishAdd = () => {
    postNewDish(addDish.value).then((res) => {
        getNewDishesData(1);
        getNewDishesData(2);
    }).catch((error) => {
        console.log(error);
    })
}
const handleNewDishDelete = (id) => {
    deleteNewDish(id).then((res) => {
        getNewDishesData(1);
        getNewDishesData(2);
    }).catch((error) => {
        console.log(error);
    })
}

const handleCDValidate = (prop, isValid) => editFormValidate.value[prop] = isValid;
const handleADValidate = (prop, isValid) => {
    addFormValidate.value[prop] = isValid;
    var tmp = addFormValidate.value;
    addAble.value = tmp.canteen && tmp.floor && tmp.window && tmp.name && tmp.measure && tmp.price;
}

const resetCsChangedData = () =>
    csChangedData.value = {
        "canteen": null,
        "floor": null,
        "window": null,
        "name": '',
        "measure": '',
        "price": null,
    };
const resetCsAddData = () =>
    csAddData.value = {
        "canteen": null,
        "floor": null,
        "window": null,
        "name": '',
        "measure": '',
        "price": null,
    };

const handleEditFormComfirm = () => {
    var tmp1 = csChangedData.value;
    var tmp2 = csDisplay.value
    var csPut = {
        "canteen": tmp1.canteen === null ? tmp2.canteen : Number(tmp1.canteen),
        "floor": tmp1.floor === null ? tmp2.floor : Number(tmp1.floor),
        "window": (tmp1.window === null || tmp1.window === '') ? tmp2.window : tmp1.window,
        "name": tmp1.name === '' ? tmp2.name : tmp1.name,
        "measure": tmp1.measure === '' ? tmp2.measure : tmp1.measure,
        "price": (tmp1.price === null || tmp1.price === '') ? tmp2.price : tmp1.price,
        "id": tmp2.id,
    }
    putEditDish(csPut).then((res) => {
        getRawData(0);
    }).catch((error) => {
        console.log(error);
    });
    editFormVisible.value = false;
    resetCsChangedData();
}
const handleAddFormComfirm = () => {
    postAddDish(csAddData.value).then((res) => {
        getRawData(0);
    }).catch((error) => {
        console.log(error);
    });
    addFormVisible.value = false;
    resetCsAddData();
}

const handleEditFormCancel = () => {
    editFormVisible.value = false;
    resetCsChangedData();
}
const handleAddFormCancel = () => {
    addFormVisible.value = false;
    resetCsAddData();
}

const handleExcelChange = (uploadFile) => importExcel(uploadFile.raw);

const handleExcelExceed = (files) => {
    const newFile = files[0];
    newFile.uid = genFileId();
    importExcel(newFile);
}

const exportExcel = () => {
    const workbook = new ExcelJS.Workbook();
    const sheet1 = workbook.addWorksheet("sheet1");
    // 获取表头所有键
    const headers = [];
    Object.keys(rawData.value[0]).forEach((key) => headers.push(excelHeaderDict[key]));
    sheet1.addRow(headers);
    // 将数据写入工作表
    rawData.value.forEach((row) => {
        const values = Object.values(row)
        sheet1.addRow(values);
    });
    // 导出表格文件
    workbook.xlsx.writeBuffer().then((buffer) => {
        let newFile = new Blob([buffer], { type: "application/octet-stream" });
        FileSaver.saveAs(newFile, "ewCRUD.xlsx");
    }).catch(error => console.log('Error writing excel export', error));
}

const importExcel = (uploadFile) => {
    const workbook = new ExcelJS.Workbook();
    const fileReader = new FileReader();
    file = uploadFile;
    fileReader.readAsArrayBuffer(uploadFile);
    fileReader.onload = ev => {
        // 从 buffer中加载数据解析
        workbook.xlsx.load(ev.target.result).then(workbook => {
            const worksheet = workbook.getWorksheet(1);
            // 第一行
            const headers = [];
            worksheet.getRow(1).eachCell((cell) => {
                headers.push(excelHeaderDictT[cell.value]);
            });
            // 数据
            const data = [];
            // 遍历
            for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
                const rowData = {};
                const row = worksheet.getRow(rowNumber);
                for (var i = 1; i < headers.length + 1; i++) {
                    rowData[headers[i - 1]] = row.getCell(i).value || '';
                };
                data.push(rowData);
            }
            rawData.value = data;
            console.log(rawData.value);
        }).catch(error => console.log('Error reading excel export', error));
    }
}

const uploadExcel = () => {
    const formData = new FormData();
    formData.append('file', file);
    console.log(formData.get('file'));
    postUploadExcel(formData).then((res) => {
        console.log(res);
    }).catch((error) => {
        console.log(error);
    })
}

const carouselChangeData = ref({
    "canteen": null,
    "image": '',
});

const handleCarouselEdit = () => {
    postCarousel(carouselChangeData).then((res) => {
        console.log(res);
    }).catch((error) => {
        console.log(error);
    })
}

watch(
    () => csChangedData.value.canteen,
    () => csChangedData.value.floor = null,
    { deep: true }
);
watch(
    () => csAddData.value.canteen,
    () => {
        csAddData.value.floor = null;
        addFormValidate.value.floor = false;
    },
    { deep: true }
);

watch(
    () => carouselChangeData.value.canteen,
    (canteen) => getCarouselData(canteen),
    { deep: true }
)
</script>

<template>
    <el-container>
        <el-aside width="12%">
            <el-menu default-active="1" class="operation_menu" @select="handleMenuChange" background-color="#F9F9F9">
                <el-menu-item index="1">
                    <span>增删改查</span>
                </el-menu-item>
                <el-menu-item index="2">
                    <span>更改轮播图</span>
                </el-menu-item>
                <el-menu-item index="3">
                    <span>更改上新菜品</span>
                </el-menu-item>
            </el-menu>
        </el-aside>
        <el-main>
            <div v-show="mainContentVisible[0]">
                <el-menu :ellipsis=false default-active="1" mode="horizontal" @select="getRawData" class="canteen_menu">
                    <el-menu-item index="1">欣园餐厅</el-menu-item>
                    <el-menu-item index="2">悦园餐厅</el-menu-item>
                    <div class="flex-grow" />
                    <el-button text type="primary" id="refresh" @click="getRawData(0)">刷新</el-button>
                </el-menu>
                <div>
                    <el-upload action accept=".xlsx,.xls" :show-file-list="false" :on-change="handleExcelChange"
                        :on-exceed="handleExcelExceed" :limit="1" :auto-upload="false" class="upload_excel">
                        <template #trigger>
                            <el-button type="primary">选取Excel文件</el-button>
                        </template>
                        <el-button type="success" @click="uploadExcel">上传Excel文件</el-button>
                    </el-upload>
                    <el-button type="info" @click="exportExcel">导出Excel文件</el-button>
                    <el-input v-model="search" style="width: 240px" placeholder="键入以搜索" />
                </div>
                <div>
                    <el-table :data="pageData" stripe border style="width: 100%">
                        <el-table-column prop="id" label="编号" width="80" />
                        <el-table-column label="餐厅" width="80">
                            <template #default="scope">
                                <span>{{ canteenDict[scope.row.canteen] }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="楼层" width="80">
                            <template #default="scope">
                                <span>{{ floorDict[scope.row.floor] }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="window" label="窗口" width="150" />
                        <el-table-column label="菜品" width="150">
                            <template #default="scope">
                                <span class="cuisine_name">{{ scope.row.name }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="price" label="价格" width="80">
                            <template #default="scope">
                                <span class="price_number">{{ scope.row.price }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="measure" label="标准" width="80" />
                        <el-table-column prop="average_vote" label="评分" width="250">
                            <template #default="scope">
                                <el-rate v-model="scope.row.average_vote" disabled show-score text-color="#ff9900"
                                    score-template="{value} points" />
                            </template>
                        </el-table-column>
                        <el-table-column prop="image" label="图片" />
                        <el-table-column width="180" align="right">
                            <template #header>
                                <span id="operation_title">操作</span>
                                <el-button primary size="small" type="success" @click="handleAdd">
                                    新增
                                </el-button>
                            </template>
                            <template #default="scope">
                                <el-button text size="small" type="primary" @click="handleEdit(scope.row)">
                                    编辑
                                </el-button>
                                <el-button text size="small" type="danger"
                                    @click="handleDelete(scope.row.id, scope.row.name)">
                                    删除
                                </el-button>
                            </template>
                        </el-table-column>
                        </el-table>

                    <el-pagination background layout="prev, pager, next" :page-size="10" :page-count="totalPages"
                        v-model:current-page="currentPage" />
                </div>

            </div>
            <div v-show="mainContentVisible[1]">
                <el-main>
                    <el-carousel indicator-position="outside">
                        <el-carousel-item v-for="item in 4" :key="item">
                            <h3 text="2xl" justify="center">{{ item }}</h3>
                        </el-carousel-item>
                    </el-carousel>
                    <el-form :model="carouselChangeData" :inline="true">
                        <el-form-item label="轮播图页码" :label-width="100" style="width: 200px">
                            <el-select v-model.number="carouselChangeData.canteen" placeholder="请选择轮播图页码">
                                <el-option label="1" value=1 />
                                <el-option label="2" value=2 />
                                <el-option label="3" value=3 />
                                <el-option label="4" value=4 />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="图片资源地址" :label-width="100" style="width: 600px">
                            <el-input v-model="carouselChangeData.image" :placeholder="imageSrc" clearable />
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" plain @click="handleCarouselEdit">确认</el-button>
                            <!-- <el-button>删除</el-button> -->
                        </el-form-item>
                    </el-form>
                </el-main>
            </div>
            <div v-show="mainContentVisible[2]">
                <el-main>
                    <el-input v-model="addDish" placeholder="请输入菜品对应编号" style="width: 200px"/>
                    <el-button primary type="success" @click="handleNewDishAdd">
                        添加上新菜品
                    </el-button>
                    <el-table :data="newDishesData[1]" style="width: 100%">
                        <el-table-column prop="id" label="编号" width="80" />
                        <el-table-column label="餐厅" width="80">
                            <template #default="scope">
                                <span>{{ canteenDict[scope.row.canteen] }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="菜品" width="150">
                            <template #default="scope">
                                <span class="cuisine_name">{{ scope.row.name }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column/>
                        <el-table-column width="400" align="right">
                            <template #default="scope">
                                <el-button text size="small" type="danger"
                                    @click="handleNewDishDelete(scope.row.id)">
                                    删除
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-table :data="newDishesData[2]" style="width: 100%">
                        <el-table-column prop="id" label="编号" width="80" />
                        <el-table-column label="餐厅" width="80">
                            <template #default="scope">
                                <span>{{ canteenDict[scope.row.canteen] }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="菜品" width="150">
                            <template #default="scope">
                                <span class="cuisine_name">{{ scope.row.name }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column/>
                        <el-table-column width="400" align="right">
                            <template #default="scope">
                                <el-button text size="small" type="danger"
                                    @click="handleNewDishDelete(scope.row.id)">
                                    删除
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-main>
            </div>
            <!-- <template #footer>
                <div class="dialog-footer">
                    <el-button @click="handleEditFormCancel">取消</el-button>
                    <el-button type="primary" @click="handleEditFormComfirm">确认</el-button>
                </div>
            </template> -->
        </el-main>
    </el-container>

    <el-dialog v-model="editFormVisible" title="修改信息" width="400" draggable :show-close="false"
        :before-close="handleEditFormCancel">
        <el-form :model="csChangedData" @validate="handleCDValidate">
            <el-form-item label="餐厅" :label-width="formLabelWidth">
                <el-select v-model="csChangedData.canteen" :placeholder="canteenDict[csDisplay.canteen]">
                    <el-option label="欣园" value="1" />
                    <el-option label="悦园" value="2" />
                </el-select>
            </el-form-item>
            <el-form-item label="楼层" :label-width="formLabelWidth" v-if="csChangedData.canteen === '1'">
                <el-select v-model="csChangedData.floor" :placeholder="floorDict[csDisplay.floor]">
                    <el-option label="一楼" value="1" />
                    <el-option label="二楼" value="2" />
                    <el-option label="三楼" value="3" />
                </el-select>
            </el-form-item>
            <el-form-item label="楼层" :label-width="formLabelWidth" v-else-if="csChangedData.canteen === '2'">
                <el-select v-model="csChangedData.floor" :placeholder="floorDict[csDisplay.floor]">
                    <el-option label="一楼" value="1" />
                    <el-option label="二楼" value="2" />
                </el-select>
            </el-form-item>
            <el-form-item label="楼层" :label-width="formLabelWidth" v-else>
                <el-select v-model="csChangedData.floor" :placeholder="floorDict[csDisplay.floor]" />
            </el-form-item>
            <el-form-item label="窗口" :label-width="formLabelWidth" prop="window"
                :rules="[{ type: 'number', message: '这里需要填一个数字！' }]">
                <el-input v-model.number="csChangedData.window" :placeholder="csDisplay.window.toString()" />
            </el-form-item>
            <el-form-item label="菜品" :label-width="formLabelWidth">
                <el-input v-model="csChangedData.name" :placeholder="csDisplay.name" />
            </el-form-item>
            <el-form-item label="价格" :label-width="formLabelWidth" prop="price"
                :rules="[{ type: 'number', message: '这里需要填一个数字！' }]">
                <el-input v-model.number="csChangedData.price" :placeholder="csDisplay.price.toString()" />
            </el-form-item>
            <el-form-item label="标准" :label-width="formLabelWidth">
                <el-input v-model="csChangedData.measure" :placeholder="csDisplay.measure" />
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="handleEditFormCancel">取消</el-button>
                <el-button type="primary" @click="handleEditFormComfirm" :disabled="!editAble">确认</el-button>
            </div>
        </template>
    </el-dialog>

    <el-dialog v-model="addFormVisible" title="新增菜品" width="400" draggable :show-close="false"
        :before-close="handleAddFormCancel">
        <el-form :model="csAddData" @validate="handleADValidate">
            <el-form-item label="餐厅" :label-width="formLabelWidth" prop="canteen"
                :rules="[{ required: true, message: '这里必须填写！' }]">
                <el-select v-model="csAddData.canteen">
                    <el-option label="欣园" value="1" />
                    <el-option label="悦园" value="2" />
                </el-select>
            </el-form-item>
            <el-form-item label="楼层" :label-width="formLabelWidth" v-if="csAddData.canteen === '1'" prop="floor"
                :rules="[{ required: true, message: '这里必须填写！' }]">
                <el-select v-model="csAddData.floor">
                    <el-option label="一楼" value="1" />
                    <el-option label="二楼" value="2" />
                    <el-option label="三楼" value="3" />
                </el-select>
            </el-form-item>
            <el-form-item label="楼层" :label-width="formLabelWidth" v-else-if="csAddData.canteen === '2'" prop="floor"
                :rules="[{ required: true, message: '这里必须填写！' }]">
                <el-select v-model="csAddData.floor">
                    <el-option label="一楼" value="1" />
                    <el-option label="二楼" value="2" />
                </el-select>
            </el-form-item>
            <el-form-item label="楼层" :label-width="formLabelWidth" v-else prop="floor"
                :rules="[{ required: true, message: '这里必须填写！' }]">
                <el-select v-model="csAddData.floor" />
            </el-form-item>
            <el-form-item label="窗口" :label-width="formLabelWidth" prop="window"
                :rules="[{ required: true, message: '这里必须填写！' }, { type: 'number', message: '这里需要填一个数字！' }]">
                <el-input v-model.number="csAddData.window" />
            </el-form-item>
            <el-form-item label="菜品" :label-width="formLabelWidth" prop="name"
                :rules="[{ required: true, message: '这里必须填写！' }]">
                <el-input v-model="csAddData.name" />
            </el-form-item>
            <el-form-item label="价格" :label-width="formLabelWidth" prop="price"
                :rules="[{ required: true, message: '这里必须填写！' }, { type: 'number', message: '这里需要填一个数字！' }]">
                <el-input v-model.number="csAddData.price" />
            </el-form-item>
            <el-form-item label="标准" :label-width="formLabelWidth" prop="measure"
                :rules="[{ required: true, message: '这里必须填写！' }]">
                <el-input v-model="csAddData.measure" />
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="handleAddFormCancel">取消</el-button>
                <el-button type="primary" @click="handleAddFormComfirm" :disabled="!addAble">确认</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style scope>
.operation_menu {
    height: 100%;
    padding-top: 20px;
}

.upload_excel {
    display: inline;
}

.canteen_menu {
    margin-top: -15px;
    margin-bottom: 10px;
    height: 50px;
}

.cuisine_name {
    font-weight: 700;
    color: #665eff;
}

.price_number {
    color: black;
}

#operation_title {
    position: absolute;
    left: 5%;
}

.flex-grow {
    flex-grow: 1;
}

#refresh {
    margin: auto;
}
</style>
