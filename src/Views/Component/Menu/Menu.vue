<script>
export default {
    data() {
        return {
            role: 0,
            isLoggedIn: false,
            menuItems: []
        };
    },
    methods: {
        updateMenu() {
            this.isLoggedIn = !!localStorage.getItem('token');
            this.role = Number(localStorage.getItem('role')) || 0;

            const menuByRole = {
                1: [
                    { label: 'HOME', path: '/home-user' },
                    { label: 'TRACKING', path: '/track' }
                ],
                2: [
                    { label: 'HOME', path: '/home-admin' },
                    {
                        label: 'REPORT',
                        children: [
                            { label: 'SUGGESTION', path: '/suggestion-list' },
                            { label: 'COMPLAINT', path: '/complaint-list' }
                        ]
                    },
                    { label: 'EVALUATION', path: '/evaluation-list' },
                    { label: 'DASHBOARD', path: '/dashboard' }
                ],
                3: [
                    { label: 'HOME', path: '/home-admin' },
                    {
                        label: 'REPORT',
                        children: [
                            { label: 'SUGGESTION', path: '/suggestion-list' },
                            { label: 'COMPLAINT', path: '/complaint-list-admin' },
                            { label: 'CORRUPTION', path: '/corruption-list' }
                        ]
                    },
                    { label: 'EVALUATION', path: '/evaluation-list' },
                    { label: 'DASHBOARD', path: '/dashboard-admin' }
                ]
            };

            this.menuItems = menuByRole[this.role] || [];
        }
    },
    mounted() {
        this.updateMenu();
        window.addEventListener("user-updated", this.updateMenu);
    },
    beforeUnmount() {
        window.removeEventListener("user-updated", this.updateMenu);
    }
};
</script>

<template>
    <nav class="menu" v-if="isLoggedIn">
        <ul>
            <li v-for="(item, index) in menuItems" :key="item.label" class="menu-item">
                <span v-if="index === 0">|</span>
                <div v-if="item.children" class="dropdown">
                    <span class="dropdown-label">{{ item.label }}</span>
                    <ul class="dropdown-menu" style="text-align: center; margin: 0; padding: 0; list-style: none;">
                        <li v-for="child in item.children" :key="child.path"
                            style="padding: 5px 0; margin: 0; list-style: none;">
                            <router-link :to="child.path"
                                style="display: inline-block; text-decoration: none; color: black; text-align: center; border-bottom: 2px solid transparent; transition: border-color 0.3s;"
                                @mouseover="event => event.currentTarget.style.borderBottomColor = 'black'"
                                @mouseout="event => event.currentTarget.style.borderBottomColor = 'transparent'">
                                {{ child.label }}
                            </router-link>
                        </li>
                    </ul>
                </div>
                <router-link v-else :to="item.path">{{ item.label }}</router-link>
                <span class="span-last">|</span>
            </li>
        </ul>
    </nav>
</template>

<style scoped>
.menu {
    display: flex;
    justify-content: flex-start;
    background: #7D2923;
    height: 2rem;
    padding: 0 2rem;
    box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
}

.menu>ul {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 10px;
}

.menu-item {
    position: relative;
    display: flex;
    align-items: center;
    gap: 2rem;
}

.span-last {
    padding-right: 1rem;
}

.menu li span {
    color: white;
}

.menu li:first-child {
    margin-left: 20px;
}

.menu li a,
.dropdown-label {
    text-decoration: none;
    color: white;
    padding: 6px 0 1px 0;
    font-size: 0.85rem;
    border-bottom: 2px solid transparent;
    transition: border-color 0.3s;
    cursor: pointer;
}

.menu li a:hover,
.dropdown-label:hover {
    border-bottom-color: white;
}

.dropdown {
    position: relative;
}

.dropdown-menu {
    position: absolute;
    top: 21px;
    left: -45px;
    background: white;
    list-style: none;
    margin: 0;
    padding: 5px 0;
    display: none;
    flex-direction: column;
    min-width: 150px;
    border-radius: 8px;
    box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
    z-index: 10;
}

.dropdown-menu li {
    padding: 5px 15px;
}

.dropdown-menu li a {
    color: black;
    border: none;
}

.dropdown:hover .dropdown-menu {
    display: flex;
}
</style>
