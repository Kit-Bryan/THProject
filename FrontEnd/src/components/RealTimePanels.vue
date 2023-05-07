<template>
    <Transition name="panel-slide-fade">
        <div v-show="isShowPanel" class="panel-container">
            <div class="dummy-1 dummy-panel">
                <h2>Dummy-1</h2>
                <p>{{ dt1 }} °C</p>
                <p>{{ dh1 }} %</p>
            </div>
            <div class="dummy-2 dummy-panel">
                <h2>Dummy-2</h2>
                <p>{{ dt2 }} °C</p>
                <p>{{ dh2 }} %</p>
            </div>
            <div class="dummy-3 dummy-panel">
                <h2>Dummy-3</h2>
                <p>{{ dt3 }} °C</p>
                <p>{{ dh3 }} %</p>
            </div>
        </div>
    </Transition>
    <button class="toggle-panel-button" @click="isShowPanel = !isShowPanel">
        {{ isShowPanel ? "Hide Panels" : "Show Panels" }}
    </button>
</template>

<script>
export default {
    props: {},
    data() {
        return {
            dt1: "-",
            dh1: "-",
            dt2: "-",
            dh2: "-",
            dt3: "-",
            dh3: "-",
            isShowPanel: true,
        };
    },
    methods: {},
    computed: {},
};
</script>
