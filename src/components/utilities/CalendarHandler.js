class CalendarHandler {    
    constructor() {
        this.ultimoSabTrabalhado = '2024-09-21'; // Último sábado trabalhado
        this.months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        this.weeks = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        this.calendar = [];
        this.generateCalendar();
    }

    fixDecimal = (n) => n.toString().padStart(2, '0');

    formatDate(date) {
        const year = date.getFullYear();
        const month = this.fixDecimal(date.getMonth() + 1);
        const day = this.fixDecimal(date.getDate());
    
        return `${year}-${month}-${day}`;
    }

    isSaturdayWorked(currentDate) {
        const ultimoSabTrabalhado = new Date(this.ultimoSabTrabalhado);

        const timeDifference = currentDate.getTime() - ultimoSabTrabalhado.getTime();
        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

        const saturdaysPassed = Math.floor(daysDifference / 7);

        return saturdaysPassed % 2 === 0;
    }

    generateCalendar() {
        let start = new Date('2021-01-01');
        let end = new Date('2025-12-31');
        let currentDate = new Date(this.ultimoSabTrabalhado);
        let day, month, year;

        while (currentDate <= end) {
            day = currentDate.getDate();
            month = currentDate.getMonth() + 1;
            year = currentDate.getFullYear();

            let util = currentDate.getDay() != 0 && (currentDate.getDay() != 6 || this.isSaturdayWorked(currentDate));

            this.calendar.push({
                data: `${year}-${this.fixDecimal(month)}-${this.fixDecimal(day)}`,
                diaSemana: this.weeks[currentDate.getDay()],
                util
            });

            currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
        }

        currentDate = new Date(this.ultimoSabTrabalhado);
        currentDate.setDate(currentDate.getDate() - 1);

        while (start <= currentDate) {
            day = currentDate.getDate();
            month = currentDate.getMonth() + 1;
            year = currentDate.getFullYear();

            let util = currentDate.getDay() != 0 && (currentDate.getDay() != 6 || this.isSaturdayWorked(currentDate));

            this.calendar.unshift({
                data: `${year}-${this.fixDecimal(month)}-${this.fixDecimal(day)}`,
                diaSemana: this.weeks[currentDate.getDay()],
                util
            });

            currentDate = new Date(currentDate.setDate(currentDate.getDate() - 1));
        }

        //console.log(this.calendar);
    }

    getDaysBetween(startDate, endDate) {
        const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
        const [endYear, endMonth, endDay] = endDate.split('-').map(Number);

        const start = new Date(startYear, startMonth - 1, startDay);
        const end = new Date(endYear, endMonth - 1, endDay);

        return this.calendar.filter(day => {
            const [year, month, dayOfMonth] = day.data.split('-').map(Number);
            const currentDate = new Date(year, month - 1, dayOfMonth);

            return currentDate >= start && currentDate <= end;
        });
    }

    getWorkedDays(startDate, endDate, currentDate) {
        var now = new Date();

        startDate = startDate || this.formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
        endDate = endDate || this.formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
        currentDate = currentDate || now;

        var month = this.getDaysBetween(startDate, endDate);

        startDate = new Date(startDate);
        endDate = new Date(endDate);

        var total = month.length;
        var trabalhado = 0;
        var trabalhar = 0;

        month = month.filter(day => day.util);
        month.forEach(day => {
            var date = new Date(day.data);
            if (day.util && date < currentDate) trabalhado++;
            else if (day.util) trabalhar++;
        });

        return { total, trabalhado, trabalhar };
    }
}

module.exports = CalendarHandler;
