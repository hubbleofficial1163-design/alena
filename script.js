// ==============================================
// КОНФИГУРАЦИЯ БЭКЕНДА
// ==============================================
const CONFIG = {
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyD3wQjbkSk13o6lzm2RVqywpWOjSwF7FVVmMArtiVaTVSG8jqHsvemjlM_UqY6sqnv/exec',
    DEBUG: true
};

// Соответствие значений напитков для читаемого вывода
const alcoholNames = {
    'wine': 'Вино',
    'champagne': 'Шампанское',
    'vodka': 'Водка',
    'cognac': 'Коньяк',
    'whiskey': 'Виски',
    'none': 'Не пью алкоголь'
};

async function submitToGoogleSheets(formData) {
    try {
        const urlEncodedData = new URLSearchParams();
        for (let [key, value] of formData.entries()) {
            urlEncodedData.append(key, value);
        }
        
        if (CONFIG.DEBUG) {
            console.log('Отправка данных:', Object.fromEntries(formData.entries()));
        }
        
        const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: urlEncodedData.toString()
        });
        
        return { success: true };
        
    } catch (error) {
        console.error('Ошибка отправки:', error);
        return { 
            success: false, 
            error: 'Ошибка соединения с сервером'
        };
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен');
    
    // ===== ПЛЕЕР =====
    const audioPlayer = document.getElementById('wedding-audio');
    const playBtn = document.getElementById('play-btn');
    const muteBtn = document.getElementById('mute-btn');
    const progressBar = document.querySelector('.progress');
    
    if (audioPlayer && playBtn) {
        let isPlaying = false;
        
        // Автовоспроизведение при загрузке (если браузер позволяет)
        audioPlayer.volume = 0.5; // Устанавливаем громкость 50%
        
        playBtn.addEventListener('click', function() {
            if (isPlaying) {
                audioPlayer.pause();
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
            } else {
                audioPlayer.play().catch(e => console.log('Автовоспроизведение заблокировано браузером'));
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            }
            isPlaying = !isPlaying;
        });
        
        if (muteBtn) {
            muteBtn.addEventListener('click', function() {
                if (audioPlayer.muted) {
                    audioPlayer.muted = false;
                    muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
                } else {
                    audioPlayer.muted = true;
                    muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
                }
            });
        }
        
        if (audioPlayer && progressBar) {
            audioPlayer.addEventListener('timeupdate', function() {
                if (audioPlayer.duration) {
                    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
                    progressBar.style.width = `${progress}%`;
                }
            });
            
            // Сброс плеера при окончании
            audioPlayer.addEventListener('ended', function() {
                isPlaying = false;
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
                progressBar.style.width = '0%';
            });
        }
    }
    
    // ===== СЧЕТЧИК =====
    function updateCountdown() {
        const weddingDate = new Date('2026-08-08T15:30:00').getTime();
        const now = new Date().getTime();
        const timeLeft = weddingDate - now;
        
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        
        if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;
        
        if (timeLeft < 0) {
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            return;
        }
        
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        daysEl.textContent = days.toString().padStart(2, '0');
        hoursEl.textContent = hours.toString().padStart(2, '0');
        minutesEl.textContent = minutes.toString().padStart(2, '0');
        secondsEl.textContent = seconds.toString().padStart(2, '0');
    }
    
    setInterval(updateCountdown, 1000);
    updateCountdown();
    
    // ===== КАЛЕНДАРЬ =====
    function generateCalendar() {
        const calendarDays = document.getElementById('calendar-days');
        if (!calendarDays) return;
        
        calendarDays.innerHTML = '';
        
        const weddingDate = new Date('2026-08-18');
        const currentMonth = weddingDate.getMonth();
        const currentYear = weddingDate.getFullYear();
        
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        
        let firstDayOfWeek = firstDay.getDay();
        firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
        
        const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
        
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const day = document.createElement('div');
            day.className = 'day other-month';
            day.textContent = prevMonthLastDay - i;
            calendarDays.appendChild(day);
        }
        
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const day = document.createElement('div');
            day.className = 'day';
            day.textContent = i;
            
            if (i === 8) {
                day.className = 'day wedding-day';
                day.title = 'День нашей свадьбы!';
            }
            
            calendarDays.appendChild(day);
        }
        
        const totalCells = 42;
        const daysSoFar = firstDayOfWeek + lastDay.getDate();
        const nextMonthDays = totalCells - daysSoFar;
        
        for (let i = 1; i <= nextMonthDays; i++) {
            const day = document.createElement('div');
            day.className = 'day other-month';
            day.textContent = i;
            calendarDays.appendChild(day);
        }
    }
    
    generateCalendar();
    
    // ===== ВЫБОР ГОСТЕЙ =====
    const guestButtons = document.querySelectorAll('.guest-btn');
    const guestsInput = document.getElementById('guests');
    
    if (guestButtons.length > 0 && guestsInput) {
        guestButtons.forEach(button => {
            button.addEventListener('click', function() {
                guestButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                guestsInput.value = this.getAttribute('data-value');
                
                // Триггерим обновление поля дополнительного гостя
                if (typeof toggleAdditionalGuestField === 'function') {
                    toggleAdditionalGuestField();
                }
            });
        });
        
        guestButtons[0].classList.add('active');
    }

    // ===== ПОЛЕ ДЛЯ ДОПОЛНИТЕЛЬНОГО ГОСТЯ =====
    const additionalGuestField = document.getElementById('additional-guest-field');
    const additionalGuestInput = document.getElementById('additional-guest');

    function toggleAdditionalGuestField() {
        if (!additionalGuestField || !guestsInput) return;
        
        const selectedValue = parseInt(guestsInput.value) || 1;
        
        if (selectedValue > 1) {
            additionalGuestField.style.display = 'flex';
            additionalGuestField.style.flexDirection = 'column';
            if (additionalGuestInput) {
                additionalGuestInput.required = true;
                additionalGuestInput.placeholder = `Имена гостей (${selectedValue - 1} чел.)`;
            }
        } else {
            additionalGuestField.style.display = 'none';
            if (additionalGuestInput) {
                additionalGuestInput.required = false;
                additionalGuestInput.value = '';
            }
        }
    }
    
    if (guestButtons.length > 0 && additionalGuestField) {
        // Добавляем обработчики на кнопки выбора количества гостей
        guestButtons.forEach(button => {
            button.addEventListener('click', function() {
                setTimeout(toggleAdditionalGuestField, 10);
            });
        });
        
        // Проверяем начальное значение
        toggleAdditionalGuestField();
    }
    
    // ===== ЛОГИКА ДЛЯ ЧЕКБОКСОВ АЛКОГОЛЯ =====
    const alcoholCheckboxes = document.querySelectorAll('input[name="alcohol"]');
    const alcoholSelection = document.getElementById('alcohol-selection');
    const noAlcoholOption = document.getElementById('alcohol-none');
    
    // Функция для преобразования значений в читаемые названия
    function getReadableAlcoholValue(value) {
        return alcoholNames[value] || value;
    }
    
    // Функция для обновления скрытого поля с выбранными напитками
    function updateAlcoholSelection() {
        if (!alcoholSelection) return;
        
        const selected = [];
        alcoholCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selected.push(getReadableAlcoholValue(checkbox.value));
            }
        });
        
        alcoholSelection.value = selected.join(', ');
        
        if (CONFIG.DEBUG) {
            console.log('Выбраны напитки:', alcoholSelection.value);
        }
    }
    
    // Логика для опции "Не пью алкоголь"
    if (noAlcoholOption) {
        noAlcoholOption.addEventListener('change', function() {
            if (this.checked) {
                alcoholCheckboxes.forEach(cb => {
                    if (cb.id !== 'alcohol-none') {
                        cb.checked = false;
                    }
                });
            }
            updateAlcoholSelection();
        });
    }
    
    // Логика для остальных чекбоксов
    alcoholCheckboxes.forEach(checkbox => {
        if (checkbox.id !== 'alcohol-none') {
            checkbox.addEventListener('change', function() {
                // Если выбран любой напиток, снимаем "Не пью алкоголь"
                if (this.checked && noAlcoholOption) {
                    noAlcoholOption.checked = false;
                }
                updateAlcoholSelection();
            });
        }
    });
    
    // Инициализация скрытого поля
    updateAlcoholSelection();
    
    // ===== ФОРМА =====
    const rsvpForm = document.getElementById('rsvp-form');
    console.log('Форма для обработки:', rsvpForm);
    
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Форма отправлена!');
            
            const submitBtn = this.querySelector('.submit-btn');
            if (!submitBtn) return;
            
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'ОТПРАВКА...';
            submitBtn.disabled = true;
            
            try {
                const formData = new FormData();
                
                // Основные поля
                formData.append('name', document.getElementById('name')?.value || '');
                formData.append('timestamp', new Date().toLocaleString('ru-RU'));
                
                // Присутствие
                const attendance = document.querySelector('input[name="attendance"]:checked');
                formData.append('attendance', attendance ? 
                    (attendance.value === 'yes' ? 'С радостью буду' : 'К сожалению, не смогу') : 'Не указано');
                
                // Количество гостей
                const guestsCount = document.getElementById('guests')?.value || '1';
                formData.append('guests', guestsCount);
                
                // Дополнительные гости
                const additionalGuest = document.getElementById('additional-guest')?.value || '';
                formData.append('additional_guest', additionalGuest);
                
                // Выбранные напитки (общая строка)
                const alcoholValue = document.getElementById('alcohol-selection')?.value || '';
                formData.append('alcohol_preferences', alcoholValue);
                
                // Добавляем каждый выбранный напиток отдельным полем для удобства анализа
                const selectedDrinks = [];
                alcoholCheckboxes.forEach(checkbox => {
                    if (checkbox.checked) {
                        const drinkName = getReadableAlcoholValue(checkbox.value);
                        selectedDrinks.push(drinkName);
                        formData.append('drink_' + drinkName, 'Да');
                    }
                });
                
                // Если ничего не выбрано, отмечаем это
                if (selectedDrinks.length === 0) {
                    formData.append('alcohol_preferences', 'Не указано');
                }
                
                if (CONFIG.DEBUG) {
                    console.log('Данные для отправки:');
                    for (let pair of formData.entries()) {
                        console.log(pair[0] + ': ' + pair[1]);
                    }
                }
                
                const result = await submitToGoogleSheets(formData);
                
                if (result.success) {
                    // Показываем модальное окно благодарности
                    const thankyouModal = document.getElementById('thankyou-modal');
                    if (thankyouModal) {
                        thankyouModal.style.display = 'flex';
                        
                        // Автоматическое закрытие через 5 секунд
                        setTimeout(() => {
                            thankyouModal.style.display = 'none';
                        }, 5000);
                    } else {
                        alert('Спасибо! Ваш ответ отправлен.');
                    }
                    
                    // Сброс формы
                    rsvpForm.reset();
                    
                    // Сброс кнопок выбора гостей
                    if (guestButtons.length > 0 && guestsInput) {
                        guestButtons.forEach(btn => btn.classList.remove('active'));
                        guestButtons[0].classList.add('active');
                        guestsInput.value = "1";
                    }
                    
                    // Сброс поля дополнительного гостя
                    if (additionalGuestField) {
                        additionalGuestField.style.display = 'none';
                        if (additionalGuestInput) {
                            additionalGuestInput.value = '';
                            additionalGuestInput.required = false;
                        }
                    }
                    
                    // Сброс чекбоксов алкоголя (первый вариант или ничего)
                    alcoholCheckboxes.forEach(checkbox => {
                        checkbox.checked = false;
                    });
                    
                    // Обновляем скрытое поле
                    updateAlcoholSelection();
                    
                } else {
                    alert('Произошла ошибка при отправке. Пожалуйста, попробуйте еще раз.');
                }
                
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Произошла ошибка. Пожалуйста, попробуйте позже.');
                
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    } else {
        console.error('ФОРМА НЕ НАЙДЕНА! Проверьте id="rsvp-form" в HTML');
    }
    
    // ===== МОДАЛЬНЫЕ ОКНА =====
    const modals = document.querySelectorAll('.modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    
    // Функция закрытия модального окна
    function closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    // Открытие модального окна (если понадобится)
    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    };
    
    // Закрытие по кнопке
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Закрытие по клику вне окна
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });
    
    // Закрытие по ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            modals.forEach(modal => {
                if (modal.style.display === 'flex') {
                    closeModal(modal);
                }
            });
        }
    });
    
    // ===== ПЛАВНАЯ ПРОКРУТКА ДЛЯ ЯКОРЕЙ (если есть ссылки) =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // ===== ДИАГНОСТИКА =====
    setTimeout(function() {
        console.log('✅ Проверка элементов:');
        console.log('- Форма:', document.getElementById('rsvp-form') ? '✅' : '❌');
        console.log('- Кнопка отправки:', document.querySelector('.submit-btn') ? '✅' : '❌');
        console.log('- Поле имени:', document.getElementById('name') ? '✅' : '❌');
        console.log('- Чекбоксы алкоголя:', document.querySelectorAll('input[name="alcohol"]').length ? '✅' : '❌');
        console.log('- Плеер:', document.getElementById('wedding-audio') ? '✅' : '❌');
        console.log('- Счетчик:', document.getElementById('days') ? '✅' : '❌');
    }, 1000);
    
    // ===== ПРЕДОТВРАЩЕНИЕ СЛУЧАЙНОГО ЗАКРЫТИЯ =====
    window.addEventListener('beforeunload', function(e) {
        // Проверяем, заполнена ли форма
        const nameField = document.getElementById('name');
        if (nameField && nameField.value.trim() !== '') {
            // Если форма заполнена, предупреждаем пользователя
            e.preventDefault();
            e.returnValue = '';
        }
    });
});