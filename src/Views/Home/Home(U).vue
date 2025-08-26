<script>
export default {
    data() {
        return {
            name: localStorage.getItem('name') || '',
            division: localStorage.getItem('division') || '',
            isLoggedIn: !!localStorage.getItem('token')
        };
    }
};
</script>

<template>
    <div class="position-wrapper">
        <div class="content">
            <h1>TO REPORT</h1>
            <h4>CHOOSE A TOPIC</h4>

            <div class="card-container">
                <div class="card" @click="$router.push({ path: '/term-of-use', query: { target: 'suggestion' } })">
                    <img src="@/Assets/Image/Sugg.png" alt="Report" class="card-icon" />
                    <span>SUGGESTION</span>
                </div>

                <div class="card" @click="$router.push({ path: '/term-of-use', query: { target: 'complaint' } })">
                    <img src="@/Assets/Image/Comp.png" alt="Report" class="card-icon" />
                    <span>COMPLAINT</span>
                </div>

                <div class="card" @click="$router.push({ path: '/guideline', query: { target: 'corruption' } })">
                    <img src="@/Assets/Image/Corr.png" alt="Report" class="card-icon" />
                    <span>CORRUPTION</span>
                </div>

                <div class="card" :class="{ disabled: !isLoggedIn }" @click="isLoggedIn && $router.push('/evaluation')">
                    <img src="@/Assets/Image/Eval.png" alt="Report" class="card-icon" />
                    <span>EVALUATION</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}

.card-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 50px;
    margin: 3rem 0;
}

.card {
    width: 220px;
    height: 250px;
    background: white;
    border-radius: 8px;
    box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.5s;
    gap: 8px;
}

.card:not(.disabled):hover {
    transform: scale(1.05);
    background: gray;
    color: white;
}

span {
    font-weight: bold;
    padding: 1rem 0;
}

.card img.card-icon {
    width: 70px;
    height: auto;
    transition: filter 0.05s;
}

.card:not(.disabled):hover img.card-icon {
    filter: brightness(0) invert(1);
}

.disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.disabled .card-icon {
    filter: grayscale(100%) brightness(0.7);
}
</style>
