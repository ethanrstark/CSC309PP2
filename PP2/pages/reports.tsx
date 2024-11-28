import { useEffect, useState } from 'react';

const reports = () => {
    const [posts , setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [accessDenied, setAccessDenied] = useState(false);


    const handleReportedComments = async () => {
        try{
            const response = await fetch ('/api/admin/reports?comments=true', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
            },
        });

        const results = await response.json();
        if(response.status === 403){
            setAccessDenied(true);
            return;
        }else{
            setAccessDenied(false);
        }
        setComments(results.reportedCs);
        }catch(error){
            console.error('Error', error);
            alert('An error occurred while getting reported comments.');
            setAccessDenied(true);

        }
    }

    const handleReportedPosts = async () => {
        try{
            const response = await fetch ('/api/admin/reports?posts=true', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
                },
            })
            const results = await response.json();
            if(response.status === 403){
                setAccessDenied(true);
                return;
            }else{
                setAccessDenied(false);
            }
            setPosts(results.reportedPs);
        }catch(error){
            console.error('Error', error);
            alert('An error occurred while getting reported posts.');
            setAccessDenied(true);

        }

    }

    const testAccess = async () => {
        try{
            const response = await fetch ('/api/admin/reports', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
                },
            })
            const results = await response.json();
            if(response.status === 403){
                setAccessDenied(true);
                return;
            }else{
                setAccessDenied(false);
            }
        }catch(error){
            console.error('Error', error);
            setAccessDenied(true);

        }

    }


    const hideContent = async (id: number, type: 'post' | 'comment', reason: string) => {
        var body: any;

        if(type === 'post'){
            body = JSON.stringify({ postId: id,  reason: reason})
        }else{
            body = JSON.stringify({ commentId: id, reason: reason})
        }

        try {
          const response = await fetch('/api/admin/hide', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
            },
            body: body

            
          });
      
          //responses for whether it failed or succeded
          if (response.ok) {
                if(type === 'post'){
                    alert(`post ${id} hidden successfully. Reason: ${reason}`);

                }else{
                    alert(`comment ${id} hidden successfully. Reason: ${reason}`);
                }
          }else {
                if(type === 'post'){
                    alert(`failed to hide post with id: ${id}`);

                }else{
                    alert(`failed to hide comment with id: ${id}`);
                }
          }

        //unexpected errors
        } catch (error) {
          console.error('Error hiding content:', error);
          alert('An error occurred while hiding the content.');
        }

    };


    //runs at start of page load, if not an admin will set accessdenied true
    useEffect(() => {
        testAccess();
        setComments([]);
    }, []);


  
    return (
    <div>
        {/* page should only show if there is access, if a button is tried access is tested */}
        {accessDenied ? (
        <div className="flex items-center justify-center h-screen w-screen">
        <h1 className="text-white font-bold text-center text-3xl">ACCESS DENIED</h1>
        </div>
        ) : (
        <div className="flex h-screen w-screen bg-gray-900">
            
    
    
            <main
            className={`p-6 h-screen w-screen bg-gray-900`}
            >

            <div className="justify-center text-center">
                    <button
                    className="bg-gray-800 w-200 text-white m-10 mb-4 rounded-lg p-6 hover:bg-gray-600"
                    onClick={handleReportedComments}>
                        Reported Comments
                    </button>

                    <button
                    className="bg-gray-800 w-200 text-white m-10 mb-4 rounded-lg p-6 hover:bg-gray-600"
                    onClick={handleReportedPosts}>
                        Reported Posts
                    </button>
    
            </div>
            
            
                <div className="p-4 text-white">
                    {posts.length > 0 && (
                        <div>
                        <h1 className="text-2xl font-bold mb-4">Reported Posts</h1>
                        <ul>
                            {posts.map((post: any) => (
                            <li
                                key={post.id}
                                className="bg-gray-800 rounded-lg p-4 mb-4 shadow-lg"
                            >
                                <h2 className="text-xl font-semibold">Post ID: {post.id}</h2>
                                <h2 className="text-xl font-semibold">{post.title}</h2>
                                <p>Description: {post.description}</p>
                                <p>Author ID: {post.authorId}</p>
                                <p>Created At: {new Date(post.createdAt).toLocaleString()}</p>
                                <p>Updated At: {new Date(post.updatedAt).toLocaleString()}</p>
                                <p>Upvotes: {post.upvoteCount}</p>
                                <p>Downvotes: {post.downvoteCount}</p>
                                <form onSubmit={(e) => {
                                e.preventDefault();
                                const reason = (e.target as any).elements.reason.value;
                                hideContent(post.id, 'post', reason);
                            }} className="mt-4">
                                <input
                                type="text"
                                name="reason"
                                placeholder="Reason"
                                className="p-2 w-full text-black rounded"
                                />

                                <button type="submit" className="p-2 m-2 bg-gray-700 rounded-md">
                                Hide
                                </button>
                            </form>




                                <h3 className="text-lg font-semibold mt-4">Reports:</h3>
                                <ul className="ml-4">
                                {post.reports.map((report: any) => (
                                    <li key={report.id} className="bg-gray-700 rounded p-2 mb-2">
                                    <p>Reason: {report.reason}</p>
                                    <p>User ID: {report.userId}</p>
                                    <p>Reported At: {new Date(report.createdAt).toLocaleString()}</p>
                                    </li>
                                ))}
                                </ul>
                            </li>
                            ))}
                        </ul>
                        </div>
                    )}





                    {comments.length > 0 && (
                    <div>
                    <h1 className="text-2xl font-bold mb-4">Reported Comments</h1>
                    <ul>
                        {comments.map((comment: any) => (
                        <li
                            key={comment.id}
                            className="bg-gray-800 rounded-lg p-4 mb-4 shadow-lg"
                        >
                            <h2 className="text-xl font-semibold">Comment ID: {comment.id}</h2>
                            <p>Content: {comment.content}</p>
                            <p>Author ID: {comment.authorId}</p>
                            <p>Created At: {new Date(comment.createdAt).toLocaleString()}</p>
                            <p>Updated At: {new Date(comment.updatedAt).toLocaleString()}</p>
                            <p>Upvotes: {comment.upvoteCount}</p>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const reason = (e.target as any).elements.reason.value;
                                hideContent(comment.id, 'comment', reason);
                            }} className="mt-4">
                                <input
                                type="text"
                                name="reason"
                                placeholder="Reason"
                                className="p-2 w-full text-black rounded"
                                />

                                <button type="submit" className="p-2 m-2 bg-gray-700 rounded-md">
                                Hide
                                </button>
                            </form>




                            <h3 className="text-lg font-semibold mt-4">Reports:</h3>
                            <ul className="ml-4">
                            {comment.reports.map((report: any) => (
                                <li key={report.id} className="bg-gray-700 rounded p-2 mb-2">
                                <p>Reason: {report.reason}</p>
                                <p>User ID: {report.userId}</p>
                                <p>Reported At: {new Date(report.createdAt).toLocaleString()}</p>
                                </li>
                            ))}
                            </ul>
                        </li>
                        ))}
                    </ul>
                    </div>
                    )}
                </div>
    
            </main>
    
    
        </div>
        )}
    </div>
    );
}

export default reports;