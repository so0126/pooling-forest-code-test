"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";


export default function Home() {
  const searchParams = useSearchParams();
  const [books, setBooks] = useState<any[]>([]);
  const [cart, setcart] = useState<any[]>([]);
  const [user_name, setUserName] = useState("");
  const [AdminMode, setAdminMode] = useState(false);
  const [newBookTitle, setnewbooktitle] = useState("");
  const [newBookPrice, setNewBookPrice] = useState("");
  const [newBookStock, setNewBookStock] = useState("");
  const [SearchTerm, setSearchTerm] = useState("");
  const [adminToken, setAdminToken] = useState("");

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_API_URL + "/books")
      .then((res) => res.json())
      .then((data) => setBooks(data));

    const isAdmin = sessionStorage.getItem("isAdmin");
    const storedUser = sessionStorage.getItem("userName");
    if (isAdmin === "true") {
      setAdminMode(true);
      setUserName(storedUser || "");
    }
  }, []);

  function addToCart(book: any) {
    fetch(process.env.NEXT_PUBLIC_API_URL + "/cart?bookId=" + book.id + "&user=" + user_name)
      .then((res) => res.json())
      .then(() => {
        setcart([...cart, book]);
        alert("장바구니에 추가되었습니다!");
      });
  }

  function removeFromCart(index: number) {
    const newCart = cart.filter((_, i) => i !== index);
    setcart(newCart);
  }

  const addBook = () => {
    if (!newBookTitle || !newBookPrice || newBookStock === "") {
      alert("제목, 가격, 재고를 모두 정확히 입력해주세요!");
      return;
    }

    fetch(process.env.NEXT_PUBLIC_API_URL + "/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newBookTitle,
        price: Number(newBookPrice),
        stock: Number(newBookStock) || 0, // 재고 추가
        admin: AdminMode ? "true" : "false",
      }),
    })
      .then((res) => res.json())
      .then((newBook) => {
        setBooks([...books, newBook]);
        setnewbooktitle("");
        setNewBookPrice("");
      });
  };
  const handleReset = async () => {
    if (!adminToken) {
      alert("관리자 토큰을 입력해주세요!");
      return;
    }

    if (!confirm("정말로 모든 데이터를 초기화하시겠습니까?")) return;

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "reset", 
          token: adminToken // 입력한 토큰을 백엔드로 전달
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("초기화 성공!");
        window.location.reload();
      } else {
        alert(`실패: ${data.error}`);
      }
    } catch (e) {
      alert("서버 통신 중 오류가 발생했습니다.");
    }
  };
  const FilteredBooks = SearchTerm
    ? books.filter((b) =>
      b.title.toLowerCase().includes(SearchTerm.toLowerCase())
    )
    : books;
  return (
    <div className="bg-white min-h-screen">
      <nav
        className="p-4 mb-5"
        style={{ background: "#2c3e50", color: "white" }}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">📚 레거시 서점</h2>
          <div className="flex gap-4 items-center">
            <a href="/" className="px-3 py-1 rounded bg-slate-700">홈</a>
            {AdminMode ? (
              <span className="text-yellow-300 font-bold">{user_name}님 (관리자)</span>
            ) : (
              <a href="/login" className="px-3 py-1 rounded bg-slate-700">로그인</a>
            )}
          
          </div>
        </div>
      </nav>

      <div className="p-5">
        <input
          placeholder="도서 검색..."
          value={SearchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 mb-5 rounded"
          style={{ border: "1px solid #ddd", background: "#fafafa" }}
        />

        {AdminMode && (
          <div
            className="p-4 mb-5 rounded"
            style={{ background: "#fffef7", border: "1px solid #f0e68c" }}
          >

            
            <h3 className="mb-3 font-semibold" style={{ color: "#34495e" }}>
              📝 도서 추가 (관리자 전용)
            </h3>
            <input
              placeholder="제목"
              value={newBookTitle}
              onChange={(e) => setnewbooktitle(e.target.value)}
              className="px-3 py-2 mr-2 border border-gray-300 rounded"
              style={{ background: "#fff" }}
            />
            <input
              placeholder="가격"
              value={newBookPrice}
              type="number"
              onChange={(e) => setNewBookPrice(e.target.value)}
              className="px-3 py-2 mr-2 border border-gray-300 rounded"
              style={{ background: "#fff" }}
            />
            <input
              placeholder="재고"
              type="number"
              value={newBookStock}
              onChange={(e) => setNewBookStock(e.target.value)}
              className="px-3 py-2 mr-2 border border-gray-300 rounded"
            />
            <button
              onClick={addBook}
              className="px-4 py-2 text-white rounded"
              style={{ background: "#27ae60" }}
            >
              추가
            </button>

            <section className="mt-8 p-6 border-2 border-red-500 rounded-lg bg-red-50">
          <h2 className="text-xl font-bold text-red-700 mb-4">관리자 위험 구역</h2>
          
          <div className="flex gap-4 items-center">
            <input
              type="password"
              placeholder="관리자 토큰(ADMIN_TOKEN) 입력"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              className="border p-2 rounded flex-1"
            />
            <button
              onClick={handleReset}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              DB 전체 초기화 (Reset)
            </button>
          </div>
          <p className="text-xs text-red-500 mt-2">* .env에 설정한 토큰값과 일치해야 작동합니다.</p>
        </section>

          </div>
        )}

        <div className="grid grid-cols-3 gap-5">
          {FilteredBooks.map((book, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg shadow-sm"
              style={{ border: "1px solid #e0e0e0", background: "#fefefe" }}
            >
              <h3 className="mb-2 font-semibold" style={{ color: "#2980b9" }}>
                {book.title}
              </h3>
              <p
                className="text-lg font-bold mb-1"
                style={{ color: "#c0392b" }}
              >
                {book.price}원
              </p>
              <p className="text-sm mb-3" style={{ color: "#7f8c8d" }}>
                재고: {book.stock ?? "정보없음"}
              </p>
              <button
                onClick={() => addToCart(book)}
                className="w-full py-2 text-white rounded border-0 cursor-pointer"
                style={{ background: "#e74c3c" }}
              >
                장바구니 담기
              </button>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="mt-8 p-5 rounded" style={{ background: "#f8f9fa" }}>
            <h2 className="mb-4 font-bold" style={{ color: "#2c3e50" }}>
              🛒 장바구니 ({cart.length})
            </h2>
            {cart.map((item, i) => (
              <div key={i} className="py-2 border-b flex justify-between items-center" style={{ borderColor: "#dee2e6" }}>
                <span>{item.title} - {item.price}원</span>
                <button
                  onClick={() => removeFromCart(i)}
                  className="text-xs px-2 py-1 bg-gray-200 hover:bg-red-100 text-gray-600 hover:text-red-600 rounded"
                >
                  삭제
                </button>
              </div>
            ))}
            <div
              className="mt-4 text-xl font-bold"
              style={{ color: "#2c3e50" }}
            >
              총액: {cart.reduce((sum, item: any) => sum + parseInt(item.price), 0)}
              원
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
