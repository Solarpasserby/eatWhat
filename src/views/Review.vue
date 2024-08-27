<script setup>
import { ref, watch, computed } from 'vue';
import ExcelJS from "exceljs";
import FileSaver from "file-saver";

const excelHeaderDict = {
    "id": '编号',
    "address": '位置',
    "window": '窗口',
    "cuisine": '菜品',
    "score": '评分',
    "description": '描述'
};

const fakeData = ref([{
    "id": 1001,
    "address": '欣园一楼',
    "window": '面食',
    "cuisine": '牛杂面',
    "score": 3,
    "description": '114514'
}, {
    "id": 1002,
    "address": '欣园一楼',
    "window": '煎饼果子',
    "cuisine": ' 杂粮煎饼',
    "score": 3.5,
    "description": '114514'
}, {
    "id": 1003,
    "address": '悦园一楼',
    "window": '牛腩面',
    "cuisine": '牛腩面',
    "score": 4,
    "description": '114514'
}]);

const search = ref('');
const filterFakeData = computed(() =>
    fakeData.value.filter(
        (data) =>
            !search.value ||
            data.cuisine.toLowerCase().includes(search.value.toLowerCase())
    )
);

// 导出excel文件
const exportExcel = () => {
    const workbook = new ExcelJS.Workbook();
    const sheet1 = workbook.addWorksheet("sheet1");
    // 获取表头所有键
    const headers = [];
    Object.keys(fakeData.value[0]).forEach((key) => headers.push(excelHeaderDict[key]));
    sheet1.addRow(headers);
    // 将数据写入工作表
    fakeData.value.forEach((row) => {
        const values = Object.values(row)
        sheet1.addRow(values);
    });
    // 导出表格文件
    workbook.xlsx.writeBuffer().then((buffer) => {
        let nowTime = new Date();
        let file = new Blob([buffer], { type: "application/octet-stream" });
        FileSaver.saveAs(file, nowTime.toLocaleString() + "ewReview.xlsx");
    }).catch(error => console.log('Error writing excel export', error))
}
</script>

<template>
    <h2>菜品评分</h2>
    <el-button type="success" @click="exportExcel">导出excel</el-button>
    <el-container>
        <el-aside width="15%">
            <el-menu default-active="2" class="el-menu-vertical-demo">
                <el-menu-item index="1">
                    <template #title>Navigator Two</template>
                </el-menu-item>
                <el-menu-item index="2">
                    <template #title>Navigator Two</template>
                </el-menu-item>
                <el-menu-item index="3" disabled>
                    <template #title>Navigator Three</template>
                </el-menu-item>
                <el-menu-item index="4">
                    <template #title>Navigator Four</template>
                </el-menu-item>
            </el-menu>
        </el-aside>
        <el-main>
            <el-table :data="filterFakeData" stripe :default-sort="{ prop: 'score' }" style="width: 100%">
                <el-table-column prop="id" label="编号" width="150" />
                <el-table-column prop="address" label="位置" width="150" />
                <el-table-column prop="window" label="窗口" width="150" />
                <el-table-column label="菜品" width="150">
                    <template #default="scope">
                        <span class="cuisine_name">{{ scope.row.cuisine }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="score" label="评分" sortable width="300">
                    <template #default="scope">
                        <el-rate v-model="scope.row.score" disabled show-score text-color="#ff9900"
                            score-template="{value} points" />
                    </template>
                </el-table-column>
                <el-table-column prop="description" label="描述" />
            </el-table>
        </el-main>
    </el-container>

</template>

<style scoped>
.cuisine_name {
    font-weight: 700;
    color: #665eff;
}

.div {
    display: flex;
    align-items: center;
}
</style>
