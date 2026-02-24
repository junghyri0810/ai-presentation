// 카드 전환
function showCard(cardId) {
    document.querySelectorAll('.card').forEach(card => {
        card.classList.add('hidden');
    });
    const target = document.getElementById(cardId);
    target.classList.remove('hidden');
    // 애니메이션 재실행
    target.style.animation = 'none';
    target.offsetHeight; // reflow
    target.style.animation = '';
}

// 토스트 알림
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + type;
    // show
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 비밀번호 표시/숨기기 토글
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁';
    }
}

// 비밀번호 강도 체크
document.addEventListener('DOMContentLoaded', () => {
    const signupPw = document.getElementById('signupPassword');
    const strengthBar = document.getElementById('passwordStrength');

    if (signupPw) {
        signupPw.addEventListener('input', () => {
            const val = signupPw.value;
            strengthBar.className = 'password-strength';

            if (val.length === 0) return;

            let score = 0;
            if (val.length >= 8) score++;
            if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
            if (/[0-9]/.test(val)) score++;
            if (/[^A-Za-z0-9]/.test(val)) score++;

            if (score <= 1) {
                strengthBar.classList.add('weak');
            } else if (score <= 2) {
                strengthBar.classList.add('medium');
            } else {
                strengthBar.classList.add('strong');
            }
        });
    }
});

// 로그인 처리
function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // 간단한 유효성 검사
    if (!email || !password) {
        showToast('이메일과 비밀번호를 입력해주세요.', 'error');
        return false;
    }

    // 로딩 상태
    const btn = event.target.querySelector('.btn-primary');
    const originalText = btn.textContent;
    btn.textContent = '';
    btn.classList.add('loading');

    // 시뮬레이션 (실제 서버 연동 시 fetch/axios로 대체)
    setTimeout(() => {
        btn.classList.remove('loading');
        btn.textContent = originalText;

        // 로컬 스토리지에서 사용자 확인
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            showToast(`${user.name}님, 환영합니다!`, 'success');
            if (document.getElementById('rememberMe').checked) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
        } else {
            showToast('이메일 또는 비밀번호가 올바르지 않습니다.', 'error');
            document.getElementById('loginPassword').classList.add('input-error');
            setTimeout(() => {
                document.getElementById('loginPassword').classList.remove('input-error');
            }, 2000);
        }
    }, 1200);

    return false;
}

// 회원가입 처리
function handleSignup(event) {
    event.preventDefault();

    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupPasswordConfirm').value;

    if (password !== confirm) {
        showToast('비밀번호가 일치하지 않습니다.', 'error');
        document.getElementById('signupPasswordConfirm').classList.add('input-error');
        setTimeout(() => {
            document.getElementById('signupPasswordConfirm').classList.remove('input-error');
        }, 2000);
        return false;
    }

    if (password.length < 8) {
        showToast('비밀번호는 8자 이상이어야 합니다.', 'error');
        return false;
    }

    // 로딩 상태
    const btn = event.target.querySelector('.btn-primary');
    const originalText = btn.textContent;
    btn.textContent = '';
    btn.classList.add('loading');

    setTimeout(() => {
        btn.classList.remove('loading');
        btn.textContent = originalText;

        // 로컬 스토리지에 저장
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.find(u => u.email === email)) {
            showToast('이미 가입된 이메일입니다.', 'error');
            return;
        }

        users.push({ name, email, password });
        localStorage.setItem('users', JSON.stringify(users));

        // 성공 카드 표시
        document.getElementById('successTitle').textContent = '가입 완료!';
        document.getElementById('successMessage').textContent = `${name}님, 회원가입이 완료되었습니다. 로그인해주세요.`;
        showCard('successCard');
    }, 1200);

    return false;
}

// 비밀번호 찾기 처리
function handleForgot(event) {
    event.preventDefault();

    const email = document.getElementById('forgotEmail').value.trim();

    // 로딩 상태
    const btn = event.target.querySelector('.btn-primary');
    const originalText = btn.textContent;
    btn.textContent = '';
    btn.classList.add('loading');

    setTimeout(() => {
        btn.classList.remove('loading');
        btn.textContent = originalText;

        document.getElementById('successTitle').textContent = '메일 전송 완료!';
        document.getElementById('successMessage').textContent = `${email}으로 비밀번호 재설정 링크를 보냈습니다. 이메일을 확인해주세요.`;
        showCard('successCard');
    }, 1200);

    return false;
}

// 소셜 로그인 (UI 데모)
function socialLogin(provider) {
    showToast(`${provider} 로그인은 서버 연동 후 사용 가능합니다.`, 'info');
}

// 페이지 로드 시 저장된 이메일 복원
document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('rememberedEmail');
    if (saved) {
        document.getElementById('loginEmail').value = saved;
        document.getElementById('rememberMe').checked = true;
    }
});
