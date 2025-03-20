<template>
  <table>
    <tr>
      <th>Name</th>
      <th>#Wünsche</th>
      <th>#Gewünscht?</th>
      <th>Wünsche</th>
    </tr>
    <tr v-for="(t,i) in teilnehmer">
      <td>{{ t.name }}</td>
      <td>{{ t.wuensche.length }}</td>
      <td>{{ t.gewuenscht }}</td>
      <td>{{t.wuensche.join(", ")}}</td>
    </tr>
  </table>
</template>

<script>
export default{
  components: {

  },
  props: {
    teilnehmer: Object
  }
}
</script>

<style scoped>
  table{
    border-collapse: collapse;
    text-align: left;
  }
  td,th{
    border: 1pt solid black;
  }
  tr:nth-child(even){
    background-color: lightgray;
  }
  tr:hover{
    background-color: gold;
  }
</style>