<script>
import axios from 'axios';
import Popup from "@/Views/Component/Alert/Alert.vue";

export default {
    components: { Popup },
    data: () => ({
        form: {
            type: '',
            division: '',
            name: '',
            email: '',
            phone: '',
            currentStatus: '',
            title: '',
            details: ''
        },
        divisions: [],
        isLoggedIn: !!localStorage.getItem('token'),
        missingFields: [],
        message: "",
        showPopup: false,
        popupType: "",
        requiredFields: ['type', 'division', 'currentStatus', 'details'],
    }),
    computed: {
        currentDate() {
            const today = new Date();
            const day = today.getDate();
            const month = today.toLocaleString('en-US', { month: 'long' });
            const year = today.getFullYear() + 543;
            return `${day} ${month} ${year}`;
        }
    },
    mounted() {
        this.loadDivisions();
        if (this.isLoggedIn) this.loadProfile();
    },
    methods: {
        showMessage(type, msg) {
            this.message = msg;
            this.popupType = type;
            this.showPopup = true;
        },
        async loadDivisions() {
            try {
                const res = await axios.get('http://localhost:3000/divisions');
                this.divisions = res.data;
            } catch (err) {
                this.showMessage('fail', 'Failed to load divisions. Please try again.');
                console.error('Failed to load divisions:', err);
            }
        },
        async loadProfile() {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get('http://localhost:3000/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const { name, email, phone } = res.data;
                this.form.name = name || '';
                this.form.email = email || '';
                this.form.phone = phone || '';
            } catch (err) {
                this.showMessage('fail', 'Failed to load user profile. Please try again.');
                console.error('Failed to load profile:', err);
                this.form.name = '';
                this.form.email = '';
                this.form.phone = '';
            }
        },
        validatePhoneNumber() {
            const phone = this.form.phone;
            if (phone && !/^\d+$/.test(phone)) {
                this.showMessage('fail', 'Phone Number must be digits only.');
                this.$refs.phoneInput.focus();
                return false;
            }
            return true;
        },
        validateForm() {
            this.missingFields = this.requiredFields.filter(field => !this.form[field]);

            if (this.missingFields.length > 0) {
                const firstMissingField = this.missingFields[0];
                this.$refs[firstMissingField]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return false;
            }
            return true;
        },
        async submitForm() {
            if (!this.validateForm()) {
                this.showMessage('fail', 'Please fill in all required fields.');
                return;
            }

            if (!this.validatePhoneNumber()) {
                return;
            }

            try {
                await axios.post('http://localhost:3000/suggestion', this.form);
                this.showMessage('success', 'Form submitted successfully!');
                setTimeout(() => {
                    this.$router.push(this.isLoggedIn ? '/track' : '/home-user');
                }, 1000);
            } catch (err) {
                this.showMessage('fail', err.response?.data?.error || 'Error submitting form. Please try again.');
                console.error(err);
            }
        },
        cancelForm() {
            this.$router.push('/home-user');
        },
        clearMissingField(field) {
            const index = this.missingFields.indexOf(field);
            if (index > -1) {
                this.missingFields.splice(index, 1);
            }
        }
    }
};
</script>

<template>
    <div class="position-wrapper">
        <div class="content">
            <h1>Suggestion Form</h1>
            <h2>{{ currentDate }}</h2>

            <form @submit.prevent="submitForm">
                <div class="card">
                    <div :class="{ 'invalid-border': missingFields.includes('type') }" ref="type">
                        <h4>Select Type*</h4>
                        <label>
                            <input type="radio" value="Suggestion" v-model="form.type"
                                @change="clearMissingField('type')" /> Suggestion
                        </label>
                        <label>
                            <input type="radio" value="Appreciate" v-model="form.type"
                                @change="clearMissingField('type')" /> Appreciate
                        </label>
                    </div>

                    <hr>
                    <div :class="{ 'invalid-border': missingFields.includes('division') }" ref="division">
                        <h4>Division*</h4>
                        <select v-model="form.division" @change="clearMissingField('division')">
                            <option disabled value="">Select Division</option>
                            <option v-for="div in divisions" :key="div._id" :value="div.name">{{ div.name }}</option>
                        </select>
                    </div>

                    <hr>
                    <h3>Personal Information</h3>
                    <h4>
                        Full Name (Optional)
                        <input type="text" v-model="form.name" placeholder="Full Name" :readonly="isLoggedIn" />
                    </h4>
                    <h4>
                        Email (Optional)
                        <input type="email" v-model="form.email" placeholder="Email" :readonly="isLoggedIn" />
                    </h4>
                    <h4>
                        Phone Number (Optional)
                        <input type="tel" v-model="form.phone" placeholder="Phone Number" ref="phoneInput"
                            title="Phone Number must be digits only" />
                    </h4>

                    <hr>
                    <div :class="{ 'invalid-border': missingFields.includes('currentStatus') }" ref="currentStatus">
                        <h4>Current Status*</h4>
                        <label>
                            <input type="radio" value="student" v-model="form.currentStatus"
                                @change="clearMissingField('currentStatus')" /> Student
                        </label>
                        <label>
                            <input type="radio" value="staff" v-model="form.currentStatus"
                                @change="clearMissingField('currentStatus')" /> Staff
                        </label>
                        <label>
                            <input type="radio" value="alumni" v-model="form.currentStatus"
                                @change="clearMissingField('currentStatus')" /> Alumni
                        </label>
                        <label>
                            <input type="radio" value="public" v-model="form.currentStatus"
                                @change="clearMissingField('currentStatus')" /> General Public
                        </label>
                    </div>
                    <hr>
                    <div :class="{ 'invalid-border': missingFields.includes('details') }" ref="details">
                        <h3>Details</h3>
                        <h4>
                            Title (Optional)
                            <input type="text" v-model="form.title" placeholder="Title" />
                        </h4>
                        <h4>
                            Description*
                            <textarea v-model="form.details" rows="4" placeholder="Description"
                                @input="clearMissingField('details')"></textarea>
                        </h4>
                    </div>
                </div>

                <div class="button-group">
                    <button class="disagree" type="button" @click="cancelForm">Cancel</button>
                    <button class="agree" type="submit">Submit</button>
                </div>
            </form>
        </div>
        <Popup :show="showPopup" :popupType="popupType" :message="message" @close="showPopup = false" />
    </div>
</template>

<style scoped>
.content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}

.card {
    background-color: #fff;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
    margin: 20px auto;
    width: calc(100% - 80px);
    max-width: 50rem;
}

input[type="text"],
input[type="email"],
input[type="tel"],
select,
textarea {
    width: 100%;
    padding: 6px;
    margin-top: 4px;
    box-sizing: border-box;
    border-radius: 8px;
    transition: box-shadow 0.3s ease;
}

form {
    width: 100%;
    max-width: 50rem;
}

label {
    display: block;
    margin-bottom: 10px;
}

.button-group {
    display: flex;
    justify-content: space-between;
    width: 100%;
}

.invalid-border {
    border-radius: 12px;
    border: 1px solid rgba(255, 0, 0, 0.2);
    box-shadow: 0 0 5px rgba(255, 0, 0, 0.2);
    padding: 10px;
    transition: all 0.5s ease;
}
</style>