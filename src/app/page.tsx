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
  const [SearchTerm, setSearchTerm] = useState("");

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

  function addToCart(book:any) {
    fetch(process.env.NEXT_PUBLIC_API_URL + "/cart?bookId=" + book.id + "&user=" + user_name)
      .then((res) => res.json())
      .then(() => {
        setcart([...cart, book]);
        alert("장바구니에 추가되었습니다!");
      });
  }

  const addBook = () => {
    if (!newBookTitle || !newBookPrice) return;

    fetch(process.env.NEXT_PUBLIC_API_URL + "/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newBookTitle,
        price: newBookPrice,
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
          <div className="flex gap-4">
            <a
              href="/"
              className="px-3 py-1 rounded"
              style={{ background: "#34495e" }}
            >
              홈
            </a>
            <a
              href="/login"
              className="px-3 py-1 rounded"
              style={{ background: "#34495e" }}
            >
              로그인
            </a>
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
              onChange={(e) => setNewBookPrice(e.target.value)}
              className="px-3 py-2 mr-2 border border-gray-300 rounded"
              style={{ background: "#fff" }}
              type="text"
            />
            <button
              onClick={addBook}
              className="px-4 py-2 text-white rounded"
              style={{ background: "#27ae60" }}
            >
              추가
            </button>
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
                재고: {book.stock || "정보없음"}
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
              <div
                key={i}
                className="py-2 border-b"
                style={{ borderColor: "#dee2e6" }}
              >
                {item.title} - {item.price}원
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
