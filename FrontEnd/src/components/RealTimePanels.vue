<template>
    <button class="toggle-panel-button" @click="isShowPanel = !isShowPanel">
        {{ isShowPanel ? "Hide Panels" : "Show Panels" }}
    </button>
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
</template>

<script>
export default {
    props: ["dt1", "dt2", "dt3", "dh1", "dh2", "dh3"],
    data() {
        return {
            isShowPanel: true,
        };
    },
    methods: {},
    computed: {},
};
</script>
