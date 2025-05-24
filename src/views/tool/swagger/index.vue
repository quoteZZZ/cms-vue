<template>
   <i-frame v-model:src="url"></i-frame>
</template>

<script setup>
import iFrame from '@/components/iFrame'

//swagger的接口地址
//const url = ref(import.meta.env.VITE_APP_BASE_API + "/swagger-ui/index.html") 

//Knife4j的接口地址
const url = ref(import.meta.env.VITE_APP_BASE_API + "/doc.html")
</script>

