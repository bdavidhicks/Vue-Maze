<template>
  <div class="d-flex flex-wrap" :style="outerCellStyle" @click="toggleVisited">
    <div class="d-flex topLeft"      :style="topLeftStyle"></div>
    <div class="d-flex topCenter"    :style="topCenterStyle"></div>
    <div class="d-flex topRight"     :style="topRightStyle"></div>
    <div class="d-flex middleLeft"   :style="middleLeftStyle"></div>
    <div class="d-flex middleCenter" :style="middleCenterStyle"></div>
    <div class="d-flex middleRight"  :style="middleRightStyle"></div>
    <div class="d-flex bottomLeft"   :style="bottomLeftStyle"></div>
    <div class="d-flex bottomCenter" :style="bottomCenterStyle"></div>
    <div class="d-flex bottomRight"  :style="bottomRightStyle"></div>
  </div>
</template>

<script>
export default {
  props: ['cell', 'size', 'duration', 'borderWidth', 'borderColor', 'color', 'visitedColor'],
  computed: {
    outerCellStyle() {
      const h = (this.cell.edge.top || this.cell.edge.bottom) ? `${this.size + this.borderWidth / 2}px` : `${this.size}px`;
      const w = (this.cell.edge.left || this.cell.edge.right) ? `${this.size + this.borderWidth / 2}px` : `${this.size}px`;
      return {
        height: h,
        width: w,
        'min-height': h,
        'min-width': w,
      };
    },
    topLeftStyle() {
      const h = (this.cell.edge.top) ? `${this.borderWidth}px` : `${this.borderWidth / 2}px`;
      const w = (this.cell.edge.left) ? `${this.borderWidth}px` : `${this.borderWidth / 2}px`;
      return {
        height: h,
        width: w,
        'min-height': h,
        'min-width': w,
        'background-color': this.borderColor,
        transition: `background-color ${this.duration}ms linear`,
      };
    },
    topCenterStyle() {
      let { bgColor } = this;
      if (this.cell.start) {
        bgColor = 'green';
      }
      const h = (this.cell.edge.top) ? `${this.borderWidth}px` : `${this.borderWidth / 2}px`;
      const w = `${this.size - this.borderWidth}px`;
      return {
        height: h,
        width: w,
        'min-height': h,
        'min-width': w,
        'background-color': (this.cell.walls.north) ? this.borderColor : bgColor,
        transition: `background-color ${this.duration}ms linear`,
      };
    },
    topRightStyle() {
      const h = (this.cell.edge.top) ? `${this.borderWidth}px` : `${this.borderWidth / 2}px`;
      const w = (this.cell.edge.right) ? `${this.borderWidth}px` : `${this.borderWidth / 2}px`;
      return {
        height: h,
        width: w,
        'min-height': h,
        'min-width': w,
        'background-color': this.borderColor,
        transition: `background-color ${this.duration}ms linear`,
      };
    },
    middleLeftStyle() {
      const h = `${this.size - this.borderWidth}px`;
      const w = (this.cell.edge.left) ? `${this.borderWidth}px` : `${this.borderWidth / 2}px`;
      return {
        height: h,
        width: w,
        'min-height': h,
        'min-width': w,
        'background-color': (this.cell.walls.west) ? this.borderColor : this.bgColor,
        transition: `background-color ${this.duration}ms linear`,
      };
    },
    middleCenterStyle() {
      let { bgColor } = this;
      if (this.cell.start) {
        bgColor = 'green';
      } else if (this.cell.end) {
        bgColor = 'red';
      }
      const h = `${this.size - this.borderWidth}px`;
      const w = `${this.size - this.borderWidth}px`;
      return {
        height: h,
        width: w,
        'min-height': h,
        'min-width': w,
        'background-color': bgColor,
        transition: `background-color ${this.duration}ms linear`,
      };
    },
    middleRightStyle() {
      const h = `${this.size - this.borderWidth}px`;
      const w = (this.cell.edge.right) ? `${this.borderWidth}px` : `${this.borderWidth / 2}px`;
      return {
        height: h,
        width: w,
        'min-height': h,
        'min-width': w,
        'background-color': (this.cell.walls.east) ? this.borderColor : this.bgColor,
        transition: `background-color ${this.duration}ms linear`,
      };
    },
    bottomLeftStyle() {
      const h = (this.cell.edge.bottom) ? `${this.borderWidth}px` : `${this.borderWidth / 2}px`;
      const w = (this.cell.edge.left) ? `${this.borderWidth}px` : `${this.borderWidth / 2}px`;
      return {
        height: h,
        width: w,
        'min-height': h,
        'min-width': w,
        'background-color': this.borderColor,
        transition: `background-color ${this.duration}ms linear`,
      };
    },
    bottomCenterStyle() {
      let { bgColor } = this;
      if (this.cell.end) {
        bgColor = 'red';
      }
      const h = (this.cell.edge.bottom) ? `${this.borderWidth}px` : `${this.borderWidth / 2}px`;
      const w = `${this.size - this.borderWidth}px`;
      return {
        height: h,
        width: w,
        'min-height': h,
        'min-width': w,
        'background-color': (this.cell.walls.south) ? this.borderColor : bgColor,
        transition: `background-color ${this.duration}ms linear`,
      };
    },
    bottomRightStyle() {
      const h = (this.cell.edge.bottom) ? `${this.borderWidth}px` : `${this.borderWidth / 2}px`;
      const w = (this.cell.edge.right) ? `${this.borderWidth}px` : `${this.borderWidth / 2}px`;
      return {
        height: h,
        width: w,
        'min-height': h,
        'min-width': w,
        'background-color': this.borderColor,
        transition: `background-color ${this.duration}ms linear`,
      };
    },
    bgColor() {
      return (this.cell.visited) ? this.visitedColor : this.color;
    },
  },
  methods: {
    toggleVisited() {
      this.cell.visited = !this.cell.visited;
    },
  },
};
</script>

<style scoped>
</style>
