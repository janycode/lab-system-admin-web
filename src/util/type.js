const labTypes = [
  {
    label: "物理实验室",
    value: 1,
    color: "#02909d"
  },
  {
    label: "化学实验室",
    value: 2,
    color: "#eb5c20"
  },
  {
    label: "电子设计实验室",
    value: 3,
    color: "#a1d4ba"
  },
  {
    label: "生命科学研究实验室",
    value: 4,
    color: "#d05667"
  },
]

const collegeTypes = [
  {
    label: "理学院",
    value: 1,
    color: "#fbcb4a"
  },
  {
    label: "信息科学工程学院",
    value: 2,
    color: "#14c145"
  },
  {
    label: "经济管理学院",
    value: 3,
    color: "#eedeb0"
  },
  {
    label: "人文学院",
    value: 4,
    color: "#065279"
  },
]

const classTypes = [
  {
    label: "第一节课",
    value: 1
  },
  {
    label: "第二节课",
    value: 2
  },
  {
    label: "第三节课",
    value: 3
  },
  {
    label: "第四节课",
    value: 4
  },
]

const bookStateText = ["审核中", "已批准", "被驳回"]
const bookStateType = ["primary", "success", "danger"]

export {
  labTypes,
  collegeTypes,
  classTypes,
  bookStateText,
  bookStateType
}