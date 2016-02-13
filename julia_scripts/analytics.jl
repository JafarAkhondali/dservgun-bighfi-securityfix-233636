include("asian-option.jl")


timeTaken = @elapsed run_asian(1000000, 'C')
@printf "Time taken %f\n" timeTaken
