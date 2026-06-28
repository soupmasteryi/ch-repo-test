import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import Header from "../Header/Header";
import {
  listWhiteboards,
  deleteWhiteboard,
  fetchPreview,
} from "../../api/whiteboards";
import { idbRemove } from "../../idb";

function formatDate(value) {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Preview({ previewUrl }) {
  const [src, setSrc] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!previewUrl) {
      setFailed(true);
      return;
    }
    let objectUrl = null;
    let active = true;
    fetchPreview({ token: localStorage.getItem("token"), previewUrl })
      .then((url) => {
        objectUrl = url;
        if (active) setSrc(url);
        else URL.revokeObjectURL(url);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [previewUrl]);

  if (failed) {
    return (
      <div className="dashboard-preview dashboard-preview-empty">
        No preview
      </div>
    );
  }
  if (!src) {
    return (
      <div className="dashboard-preview dashboard-preview-empty">Loading…</div>
    );
  }
  return (
    <img className="dashboard-preview" src={src} alt="Whiteboard preview" />
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [whiteboards, setWhiteboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token) return;
    setLoading(true);
    listWhiteboards({ token, userId })
      .then((list) => {
        if (active) setWhiteboards(list);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleNewWhiteboard = async () => {
    localStorage.removeItem("whiteboardCode");
    localStorage.removeItem("title");
    localStorage.removeItem("isPublic");
    localStorage.removeItem("previewUrl");
    localStorage.removeItem("canvasUrl");
    idbRemove("canvasLoadData").then(() => navigate("/"));
  };

  const handleDelete = async (id) => {
    if (deletingId) return;
    setDeletingId(id);
    setError("");
    try {
      await deleteWhiteboard({
        token: localStorage.getItem("token"),
        userId: localStorage.getItem("userId"),
        id,
      });
      setWhiteboards((list) => list.filter((wb) => wb.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="dashboard-page">
      <Header />
      <div className="dashboard">
        <div className="dashboard-list dashboard-new-row">
          <button
            type="button"
            className="dashboard-item dashboard-new"
            onClick={handleNewWhiteboard}
          >
            <div className="dashboard-preview dashboard-new-preview">
              <span className="dashboard-new-plus" aria-hidden="true">
                +
              </span>
            </div>
            <div className="dashboard-meta">
              <span className="dashboard-name">New Whiteboard</span>
              <span className="dashboard-date">Start from a blank canvas</span>
            </div>
          </button>
        </div>
        <h1 className="dashboard-title">My Whiteboards</h1>
        {error && <p className="dashboard-error">{error}</p>}
        {loading ? (
          <p className="dashboard-status">Loading…</p>
        ) : whiteboards.length === 0 ? (
          <p className="dashboard-status">
            You don't have any whiteboards yet.
          </p>
        ) : (
          <ul className="dashboard-list">
            {whiteboards.map((wb) => (
              <li className="dashboard-item" key={wb.id}>
                <Link
                  to={`/wb/${encodeURIComponent(wb.id)}`}
                  className="dashboard-link"
                >
                  <Preview previewUrl={wb.previewUrl} />
                  <div className="dashboard-meta">
                    <span className="dashboard-name">
                      {wb.title || "Untitled Whiteboard"}
                    </span>
                    <span className="dashboard-date">
                      {formatDate(wb.createdAt)}
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  className="dashboard-delete"
                  onClick={() => handleDelete(wb.id)}
                  disabled={deletingId === wb.id}
                  title="Delete whiteboard"
                  aria-label="Delete whiteboard"
                >
                  🗑
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
