import { useEffect, useState } from "react";
import "./App.css";
import supabaseClient from "./config/supabaseClient";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

function App() {
  const [session, setSession] = useState(null);
  const [form, setForm] = useState({
    state: "create",
    loading: false,
  });

  const [state, setState] = useState({
    name: "",
    age: "",
    hair_colour: "",
    height: "",
    sex: "",
    updated_at: "",
    inserted_at: "",
  });

  const handleChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setForm({ ...form, loading: true });
    const payload = { ...state};
    payload.age = isNaN(payload.age) ? 0 : parseInt(payload.age);

    if (form.state === "create") {
      const { error } = await supabaseClient.from("user_bio").insert([
        {
          ...payload,
          updated_at: new Date().toISOString(),
          inserted_at: new Date().toISOString(),
          user_id: session.user.id,
        },
      ]);
      if (error) {
        alert(error.message);
      } else {
        alert("Profile created successfully");
      }
    } else {
      payload.updated_at = new Date().toISOString() ;
      payload.inserted_at = undefined;
      const { error } = await supabaseClient.from("user_bio").update(payload).match({ user_id: session.user.id });
      if (error) {
        alert(error.message);
      } else {
        alert("Profile updated successfully");
      }
    }

    setForm({ ...form, loading: false });
    fetchUserBio();
  };

  const fetchUserBio = async () => {
    if (session) {
      setForm({ ...form, loading: true });
      const { data, error } = await supabaseClient.from("user_bio").select("*").match({ user_id: session.user.id });

      if (error) {
        alert(error.message);
      } else {
        if (data.length) {
          setState(data[0]);
          setForm({ ...form, state: "update" });
        }
      }

      setForm((prev) => ({ ...prev, loading: false }));
    }
  };

  const resetUserBio = async () => {
    if (session) {
      setForm({ ...form, loading: true });
      const { error } = await supabaseClient.from("user_bio").delete().match({ user_id: session.user.id });

      if (error) {
        alert(error.message);
      } else {
        setState({
          name: "",
          age: "",
          hair_colour: "",
          height: "",
          updated_at: "",
          inserted_at: "",
        });
        setForm({ ...form, state: "create" });
      }

      setForm((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchUserBio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const formartUserEmail = (email) => {
    const splitEmail = email.split("@");
    const name = splitEmail[0];
    return name;
  };

  const formatDateAndTime = (date) => {
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString([], {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${formattedDate} ${formattedTime}`;
  };

  if (!session) {
    return <Auth supabaseClient={supabaseClient} appearance={{ theme: ThemeSupa }} providers={["github"]} />;
  } else {
    return (
      <>
        <div className="container">
          <div className="header">
            <h2>Welcome, {formartUserEmail(session?.user?.email)}</h2>
            <button onClick={() => supabaseClient.auth.signOut()} className="logout">
              Log Out
            </button>
          </div>
          <div className="body">
            <h3>User Bio</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={state.name}
                  onChange={handleChange}
                  disabled={form.loading}
                />
              </div>
              <div className="form-field">
                <label htmlFor="age">Age</label>
                <input
                  type="number"
                  name="age"
                  placeholder="Enter your age"
                  value={state.age}
                  onChange={handleChange}
                  disabled={form.loading}
                />
              </div>
              <div className="form-field">
                <label htmlFor="age">Sex</label>

                <select
                  name="sex"
                  placeholder="Enter your sex"
                  value={state.sex}
                  onChange={handleChange}
                  disabled={form.loading}
                >
                  <option value="" disabled>
                    Select Sex
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="height">Height</label>
                <input
                  type="text"
                  name="height"
                  placeholder="Enter your height in cm"
                  value={state.height}
                  onChange={handleChange}
                  disabled={form.loading}
                />
              </div>
              <div className="form-field">
                <label htmlFor="hair_colour">Hair Colour</label>
                <input
                  type="text"
                  name="hair_colour"
                  placeholder="Enter your hair colour"
                  value={state.hair_colour}
                  onChange={handleChange}
                  disabled={form.loading}
                />
              </div>

              <div className="flex">
                <button type="submit" disabled={form.loading}>
                  {form.loading ? "Loading..." : form.state === "create" ? "Create Bio" : "Update Bio"}
                </button>
                {form.state === "update" && (
                  <button onClick={resetUserBio} disabled={form.loading} type="button">
                    Reset Bio
                  </button>
                )}
              </div>
              <div className="footer">
                {state.inserted_at && (
                  <small>
                    Created: <b>{formatDateAndTime(new Date(state.inserted_at))}</b>
                  </small>
                )}
                {state.updated_at && (
                  <small>
                    Details last updated: <b>{formatDateAndTime(new Date(state.updated_at))}</b>
                  </small>
                )}
              </div>
            </form>
          </div>
        </div>
      </>
    );
  }
}

export default App;
